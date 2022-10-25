using ControlSystemsBase
using Test
using ModelPredictiveControl

@testset "ModelPredictiveControl.jl" begin
    
    # === LinModel Construction tests ===

    Ts = 4.0
    G = [   tf(1.90,[18.0,1])   tf(1.90,[18.0,1])   tf(1.90,[18.0,1]);
            tf(-0.74,[8.0,1])   tf(0.74,[8.0,1])    tf(-0.74,[8.0,1])   ]        
    
    linmodel1 = LinModel(G, Ts, i_u=1:2)
    Gss = c2d(minreal(ss(G))[:,1:2], Ts, :zoh)

    @test linmodel1.nx == 2
    @test linmodel1.nu == 2
    @test linmodel1.nd == 0
    @test linmodel1.ny == 2
    @test linmodel1.A   ≈ Gss.A
    @test linmodel1.Bu  ≈ Gss.B
    @test linmodel1.Bd  ≈ zeros(2,0)
    @test linmodel1.C   ≈ Gss.C
    @test linmodel1.Dd  ≈ zeros(2,0)

    linmodel2 = LinModel(Gss,Ts,u_op=[10,50],y_op=[50,30])
    @test linmodel2.A       ≈ Gss.A
    @test linmodel2.Bu      ≈ Gss.B
    @test linmodel2.Bd      ≈ zeros(2,0)
    @test linmodel2.C       ≈ Gss.C
    @test linmodel2.Dd      ≈ zeros(2,0)
    @test linmodel2.u_op    ≈ [10,50]
    @test linmodel2.y_op    ≈ [50,30]
    @test linmodel2.d_op    ≈ zeros(0,1)

    linmodel3 = LinModel(G,Ts,i_d=[3])
    @test linmodel3.nx == 4
    @test linmodel3.nu == 2
    @test linmodel3.nd == 1
    @test linmodel3.ny == 2
    Gu_ss = sminreal(c2d(minreal(ss(G))[:,1:2], Ts, :zoh))
    Gd_ss = sminreal(c2d(minreal(ss(G))[:,3],   Ts, :tustin))
    Gss = [Gu_ss Gd_ss]
    @test linmodel3.A   ≈ Gss.A
    @test linmodel3.Bu  ≈ Gss.B[:,1:2]
    @test linmodel3.Bd  ≈ Gss.B[:,3]
    @test linmodel3.C   ≈ Gss.C
    @test linmodel3.Dd  ≈ Gss.D[:,3]

    @test_throws ErrorException LinModel(G,-Ts)
    @test_throws ErrorException LinModel(G,Ts,i_u=[1,1])
    @test_throws ErrorException LinModel(Gss,Ts+1)
    @test_throws ErrorException LinModel(G,Ts,u_op=[0,0,0,0,0])
    @test_throws ErrorException LinModel(G,Ts,d_op=[0,0,0,0,0])
    @test_throws ErrorException LinModel(G,Ts,y_op=[0,0,0,0,0])
    Gss.D .= 1
    @test_throws ErrorException LinModel(Gss,Ts)

    # === NonLinModel Construction tests ===

    f(x,u,_) = linmodel1.A*x + linmodel1.Bu*u
    h(x,_)   = linmodel1.C*x
    nonlinmodel1 = NonLinModel(f,h,Ts,2,2,2)
    @test nonlinmodel1.nx == 2
    @test nonlinmodel1.nu == 2
    @test nonlinmodel1.nd == 0
    @test nonlinmodel1.ny == 2
    @test nonlinmodel1.f([0,0],[0,0],[1]) ≈ zeros(2,)
    @test nonlinmodel1.h([0,0],[1]) ≈ zeros(2,)

    f2(x,u,d) = linmodel3.A*x + linmodel3.Bu*u + linmodel3.Bd*d
    h2(x,_)   = linmodel3.C*x 
    nonlinmodel2 = NonLinModel(f2,h2,Ts,2,4,2,1)

    @test nonlinmodel2.nx == 4
    @test nonlinmodel2.nu == 2
    @test nonlinmodel2.nd == 1
    @test nonlinmodel2.ny == 2
    @test nonlinmodel2.f([0,0,0,0],[0,0],[0]) ≈ zeros(4,)
    @test nonlinmodel2.h([0,0,0,0],[0]) ≈ zeros(2,)


end
