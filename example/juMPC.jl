# spell-checker: disable

using Pkg
using Revise
Pkg.activate(".")

using ModelPredictiveControl
#using DAQP
#using JuMP 
using LinearAlgebra
using ControlSystemsBase
using MAT

vars_ml = matread("example/matlab.mat")

A   = vars_ml["mMPC"]["A"]
Bu  = vars_ml["mMPC"]["B"]
Bd  = vars_ml["mMPC"]["Bd"]
C   = vars_ml["mMPC"]["C"]
Du  = zeros(size(C,1),size(Bu,2))
Dd  = vars_ml["mMPC"]["Dd"]
Ts  = vars_ml["mMPC"]["Ts"]

linModel1 = LinModel(ss(A,Bu,C,0,Ts),Ts)
linModel2 = LinModel(ss(A,[Bu Bd],C,[Du Dd],Ts),Ts,i_d=[3])
sys = [   tf(1.90,[18.0,1])   tf(1.90,[18.0,1])   tf(1.90,[18.0,1]);
        tf(-0.74,[8.0,1])   tf(0.74,[8.0,1])    tf(-0.74,[8.0,1])   ]
linModel3 = LinModel(sys,Ts,i_d=[3])
linModel4 = LinModel(ss(A,[Bu Bd],C,[Du Dd],Ts),Ts,i_d=[3])
setop!(linModel4,uop=[10,10],yop=[50,30],dop=[5])
linModel5 = LinModel(ss(A,[Bu Bd],C,[Du Dd],Ts),Ts,i_u=1:2)
linModel6 = LinModel([delay(4) delay(8)]*sys,Ts,i_d=[3])

f(x,u,_) = A*x + Bu*u
h(x,_) = C*x
f2(x,u,d) = A*x + Bu*u + Bd*d
h2(x,_) = C*x

nonLinModel1 = NonLinModel(f,h,Ts,2,4,2)
nonLinModel2 = NonLinModel(f2,h2,Ts,2,4,2,1)

internalModel1 = InternalModel(linModel1)
internalModel2 = InternalModel(linModel1,stoch_ym=[tf([1,0],[1,-1],Ts) 0; 0 tf([1,0],[1,-1],Ts)])
internalModel3 = InternalModel(linModel1,i_ym=[1])

initstate!(internalModel1,[0,0],[1,1])

kalmanFilter1 = KalmanFilter(linModel1)
kalmanFilter2 = KalmanFilter(linModel1,nint_ym=0)

updatestate!(kalmanFilter2,[1, 1],[1, 1])

initstate!(kalmanFilter1,[0,0],[2,1])

ssKalmanFilter1 = SteadyKalmanFilter(linModel1)
ssKalmanFilter2 = SteadyKalmanFilter(linModel1,nint_ym=0)


updatestate!(ssKalmanFilter2,[1, 1],[1,1])

initstate!(ssKalmanFilter1,[0,0],[2,1])


nx = linModel4.nx
kf = KalmanFilter(linModel4, σP0=10*ones(nx), σQ=0.01*ones(nx), σR=[0.1, 0.1], σQ_int=0.05*ones(2), σP0_int=10*ones(2))

mpc = LinMPC(kf, Hp=15, Hc=1, Mwt=[1, 1] , Nwt=[0.1, 0.1], Cwt=1e6)

setconstraint!(mpc, c_umin=[0,0], c_umax=[0,0])
setconstraint!(mpc, c_ŷmin=[1,1], c_ŷmax=[1,1])
setconstraint!(mpc, umin=[5, 9.9], umax=[Inf,Inf])
setconstraint!(mpc, ŷmin=[-Inf,-Inf],ŷmax=[55, 35])
setconstraint!(mpc, Δumin=[-Inf,-Inf],Δumax=[+Inf,+Inf])

N = 200

u_data = zeros(2,N)
y_data = zeros(2,N)
r_data = zeros(2,N)
d_data = zeros(1,N)

u = linModel4.uop
d = linModel4.dop
r = [50,31]
initstate!(mpc,u,linModel4(d),d)

for k = 0:N-1
    if k == 40
        r[2] = 29
    end
    if k == 100
        r[2] = 36
    end
    if k == 150
        global d = [3]
    end
    y = linModel4(d) 
    if k ≥ 180
        y[1] += 15
    end 
    global u = moveinput!(mpc, r, d)
    u_data[:,k+1] = u
    y_data[:,k+1] = y
    r_data[:,k+1] = r 
    d_data[:,k+1] = d
    updatestate!(mpc, u, y, d)
    updatestate!(linModel4, u, d)
end

using PlotThemes, Plots
#theme(:default)
theme(:dark)
default(fontfamily="Computer Modern"); scalefontsizes(1.1)
p1 = plot(0:N-1,y_data[1,:],label=raw"$y_1$")
plot!(0:N-1,r_data[1,:],label=raw"$r_1$",linestyle=:dash)
p2 = plot(0:N-1,y_data[2,:],label=raw"$y_2$")
plot!(0:N-1,r_data[2,:],label=raw"$r_2$",linestyle=:dash)
py = plot(p1,p2, layout=[1,1])

p1 = plot(0:N-1,u_data[1,:],label=raw"$u_1$",linetype=:steppost)
p2 = plot(0:N-1,u_data[2,:],label=raw"$u_2$",linetype=:steppost)
pu = plot(p1,p2, layout=[1,1])

pd = plot(0:N-1,d_data[1,:],label=raw"$d_1$")

display(pd)
display(pu)
display(py)