using ControlSystemsBase

abstract type SimModel end

struct LinModel <: SimModel
    Ts  ::Float64
    nx  ::Int
    nu  ::Int
    ny  ::Int
    nd  ::Int
    u_op::Vector{Float64}
    y_op::Vector{Float64}
    d_op::Vector{Float64}
    A   ::Matrix{Float64}
    Bu  ::Matrix{Float64}
    C   ::Matrix{Float64}
    Bd  ::Matrix{Float64}
    Dd  ::Matrix{Float64}
    function LinModel(Ts,nx,nu,ny,nd,u_op,y_op,d_op,A,Bu,C,Bd,Dd)
        size(A)     == (nx,nx) || error("A size must be $((nx,nx))")
        size(Bu)    == (nx,nu) || error("Bu size must be $((nx,nu))")
        size(C)     == (ny,nx) || error("C size must be $((ny,nx))")
        size(Bd)    == (nx,nd) || error("Bd size must be $((nx,nd))")
        size(Dd)    == (ny,nd) || error("Dd size must be $((ny,nd))")
        size(u_op)  == (nu,)   || error("u_op size must be $((nu,))")
        size(y_op)  == (ny,)   || error("y_op size must be $((ny,))")
        size(d_op)  == (nd,)   || error("d_op size must be $((nd,))")
        return new(Ts,nx,nu,ny,nd,u_op,y_op,d_op,A,Bu,C,Bd,Dd)
    end
end

function LinModel(
    G::StateSpace,
    Ts;
    i_u::Vector{Int} = Int[],
    i_d::Vector{Int} = Int[],
    u_op::Vector{Float64} = Float64[],
    y_op::Vector{Float64} = Float64[],
    d_op::Vector{Float64} = Float64[]
    )
    if isempty(i_u) && isempty(i_d)
        # assume that all inputs of G are manipulated inputs u :
        i_u = collect(1:size(G,2))
    elseif isempty(i_u) && ~isempty(i_d)
        # assume that the rest is a manipulated input u :
        i_u = collect(1:size(G,2))
        deleteat!(i_u,i_d)
    end
    if length(unique(i_u)) != length(i_u)
        error("Manipulated input indices i_u should contains valid and unique indices")
    end
    if length(unique(i_d)) != length(i_d)
        error("Measured disturbances indices i_d should contains valid and unique indices")
    end

    Gu = G[:,i_u]
    Gd = G[:,i_d]
    if ~iszero(Gu.D)
        error("State matrix D must be 0 for columns associated to manipulated inputs u")
    end
    if iscontinuous(G)
        # manipulated inputs : zero-order hold discretization
        Gu_dis = c2d(Gu,Ts,:zoh);
        # measured disturbances : tustin discretization
        Gd_dis = c2d(Gd,Ts,:tustin)
    else
        #TODO: Resample discrete system instead of throwing an error
        G.Ts == Ts || error("Sample time Ts must be identical to model.Ts")
        Gu_dis = Gu
        Gd_dis = Gd     
    end

    G_min = sminreal([Gu_dis Gd_dis]) # reduce state qty with pole-zero cancelation

    nx = size(G_min.A,1)
    nu = length(i_u)
    ny = size(G_min,1)
    nd = length(i_d)

    A   = G_min.A
    Bu  = G_min.B[:,1:nu]
    Bd  = G_min.B[:,nu+1:end]
    C   = G_min.C;
    Dd  = G_min.D[:,nu+1:end];

    isempty(u_op) && (u_op = zeros(nu,))
    isempty(y_op) && (y_op = zeros(ny,))
    isempty(d_op) && (d_op = zeros(nd,))

    size(u_op)  == (nu,)  || error("u_op size must be $((nu,))")
    size(y_op)  == (ny,)  || error("y_op size must be $((ny,))")
    size(d_op)  == (nd,)  || error("d_op size must be $((nd,))")
    
    return LinModel(Ts,nx,nu,ny,nd,u_op,y_op,d_op,A,Bu,C,Bd,Dd)
end

function LinModel(Ts,A::Matrix,B::Matrix,C::Matrix)
    nx = size(A,1)
    nu = size(B,2)
    nd = 0
    ny = size(C,1)
    u_op = zeros(nu,)
    y_op = zeros(ny,)
    d_op = zeros(nd,)
    Bd = zeros(nx,nd)
    Dd = zeros(ny,nd)
    return LinModel(Ts,nx,nu,ny,nd,u_op,y_op,d_op,A,B,C,Bd,Dd)
end 

function LinModel(Ts,A::Matrix,Bu::Matrix,C::Matrix,Bd::Matrix,Dd=[])
    nx = size(A,1)
    nu = size(Bu,2)
    nd = size(Bd,2)
    ny = size(C,1)
    u_op = zeros(nu,)
    y_op = zeros(ny,)
    d_op = zeros(nd,)
    isempty(Dd) && (Dd = zeros(ny,nd));
    return LinModel(Ts,nx,nu,ny,nd,u_op,y_op,d_op,A,Bu,C,Bd,Dd)
end

struct NonLinModel <: SimModel
    Ts::Float64
    nx  ::Int
    nu  ::Int
    ny  ::Int
    nd  ::Int
    u_op::Vector{Float64}
    y_op::Vector{Float64}
    d_op::Vector{Float64}
    SimulFunc::Function
    function NonLinModel(Ts,nx,nu,ny,nd,u_op,y_op,d_op,SimulFunc)
        size(u_op)  == (nu,)  || error("u_op size must be $((nu,))")
        size(y_op)  == (ny,)  || error("y_op size must be $((ny,))")
        size(d_op)  == (nd,)  || error("d_op size must be $((nd,))")
        return new(Ts,nx,nu,ny,nd,u_op,y_op,d_op,SimulFunc)
    end
end

function NonLinModel(Ts,nx,nu,ny,SimulFunc)
    nd = 0
    u_op = zeros(nu,)
    y_op = zeros(ny,)
    d_op = zeros(nd,)
    return NonLinModel(Ts,nx,nu,ny,nd,u_op,y_op,d_op,SimulFunc)
end

function NonLinModel(Ts,nx,nu,ny,nd,SimulFunc)
    u_op = zeros(nu,)
    y_op = zeros(ny,)
    d_op = zeros(nd,)
    return NonLinModel(Ts,nx,nu,ny,nd,u_op,y_op,d_op,SimulFunc)
end

function set_op!(model::SimModel,u_op,y_op,d_op)
end

#=
function update_x(mMPC,x,u,d)
#UPDATE_X Update |mMPC| model states with current states |x|, manipulated
#input |u| and measured disturbance |d|.
    
        if ~mMPC.nd
            d = zeros(0,1); # d argument ignored
        end
    
        d0 = d - mMPC.d_op;
        u0 = u - mMPC.u_op;
     
        if mMPC.linModel
            xNext = mMPC.A*x + mMPC.B*u0 + mMPC.Bd*d0;
        else
            if mMPC.SimulFuncHasW   
                # processe noise w = 0 (only used for MHE observer)
                [~,Xmat] = mMPC.SimulFunc(x,u0,d0,zeros(mMPC.nx,1));
            else                              
                [~,Xmat] = mMPC.SimulFunc(x,u0,d0);
            end
            return Xmat(:,end);
        end
        
    end
=#