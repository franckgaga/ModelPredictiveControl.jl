var documenterSearchIndex = {"docs":
[{"location":"state_estim/#State-estimator-design","page":"State estimator design","title":"State estimator design","text":"","category":"section"},{"location":"state_estim/","page":"State estimator design","title":"State estimator design","text":"info: Info\nAll the state estimators support measured mathbfy^m and unmeasured  mathbfy^u model outputs, where mathbfy refers to all of them.","category":"page"},{"location":"state_estim/#StateEstimator-functions-and-types","page":"State estimator design","title":"StateEstimator functions and types","text":"","category":"section"},{"location":"state_estim/","page":"State estimator design","title":"State estimator design","text":"StateEstimator","category":"page"},{"location":"state_estim/#ModelPredictiveControl.StateEstimator","page":"State estimator design","title":"ModelPredictiveControl.StateEstimator","text":"Abstract supertype of all state estimators.\n\n\n\n(estim::StateEstimator)(d=Float64[])\n\nFunctor allowing callable StateEstimator object as an alias for evaloutput.\n\nExamples\n\njulia> kf = KalmanFilter(setop!(LinModel(tf(3, [10, 1]), 2), yop=[20]));\n\njulia> ŷ = kf() \n1-element Vector{Float64}:\n 20.0\n\n\n\n\n\n","category":"type"},{"location":"state_estim/#InternalModel","page":"State estimator design","title":"InternalModel","text":"","category":"section"},{"location":"state_estim/","page":"State estimator design","title":"State estimator design","text":"InternalModel\nupdatestate!(::InternalModel,::Any, ::Any, ::Any)\nevaloutput(::InternalModel, ::Any, ::Any)","category":"page"},{"location":"state_estim/#ModelPredictiveControl.InternalModel","page":"State estimator design","title":"ModelPredictiveControl.InternalModel","text":"InternalModel(model::SimModel; i_ym=1:model.ny, stoch_ym=ss(1,1,1,1,model.Ts).*I)\n\nConstruct an InternalModel estimator based on model.\n\ni_ym provides the model output indices that are measured mathbfy^m, the rest are  unmeasured mathbfy^u. model evaluates the deterministic predictions  mathbfy_d, and stoch_ym, the stochastic predictions of the measured outputs  mathbfy_s^m (the unmeasured ones being mathbfy_s^u = mathbf0). \n\nstoch_ym is a TransferFunction or StateSpace model that hypothetically filters a zero  mean white noise vector. Its default value supposes 1 integrator per measured outputs,  assuming that the current stochastic estimate mathbfy_s^m(k) = mathbfy^m(k) -  mathbfy_d^m(k) will be constant in the future. This is the dynamic matrix control (DMC)  strategy, which is simple but sometimes too aggressive. Additional poles and zeros in  stoch_ym can mitigate this.\n\nwarning: Warning\nInternalModel estimator does not work if model is integrating or unstable. The  constructor verifies these aspects for LinModel but not for NonLinModel. Uses any  other state estimator in such cases.\n\nSee also LinModel, NonLinModel\n\nExamples\n\njulia> estim = InternalModel(LinModel([tf(3, [30, 1]); tf(-2, [5, 1])], 0.5), i_ym=[2])\nInternalModel state estimator with a sample time Ts = 0.5 s and:\n 1 manipulated inputs u\n 2 states x̂\n 1 measured outputs ym\n 1 unmeasured outputs yu\n 0 measured disturbances d\n\n\n\n\n\n(estim::InternalModel)(ym, d=Float64[])\n\nFunctor allowing callable InternalModel object as an alias for evaloutput.\n\n\n\n\n\n","category":"type"},{"location":"state_estim/#ModelPredictiveControl.updatestate!-Tuple{InternalModel, Any, Any, Any}","page":"State estimator design","title":"ModelPredictiveControl.updatestate!","text":"updatestate!(estim::InternalModel, u, ym, d=Float64[])\n\nUpdate estim.x̂dx̂s states with current inputs u, measured outputs ym and dist. d.\n\n\n\n\n\n","category":"method"},{"location":"state_estim/#ModelPredictiveControl.evaloutput-Tuple{InternalModel, Any, Any}","page":"State estimator design","title":"ModelPredictiveControl.evaloutput","text":"evaloutput(estim::InternalModel, ym, d=Float64[])\n\nEvaluate InternalModel outputs ̂ŷ from estim.x̂d states.\n\nym and d are current measured outputs and disturbances, respectively. InternalModel  estimator needs current measured outputs mathbfy^m(k) to estimate its outputs  mathbfy(k), since the strategy imposes that mathbfy^m(k) = mathbfy^m(k)  is always true. \n\n\n\n\n\n","category":"method"},{"location":"state_estim/#Luenburger","page":"State estimator design","title":"Luenburger","text":"","category":"section"},{"location":"state_estim/#SteadyKalmanFilter","page":"State estimator design","title":"SteadyKalmanFilter","text":"","category":"section"},{"location":"state_estim/#KalmanFilter","page":"State estimator design","title":"KalmanFilter","text":"","category":"section"},{"location":"state_estim/","page":"State estimator design","title":"State estimator design","text":"KalmanFilter\nupdatestate!(::KalmanFilter,::Any, ::Any, ::Any)\nevaloutput(::KalmanFilter, ::Any)","category":"page"},{"location":"state_estim/#ModelPredictiveControl.KalmanFilter","page":"State estimator design","title":"ModelPredictiveControl.KalmanFilter","text":"KalmanFilter(model::LinModel; <keyword arguments>)\n\nConstruct a time-varying KalmanFilter based on model.\n\nThe process model is :\n\n\n\nArguments\n\nmodel::LinModel : (deterministic) model for the estimations.\ni_ym=1:model.ny : model output indices that are measured mathbfy^m, the rest    are unmeasured mathbfy^u.\nσP0=10*ones(model.nx) : standard deviation vector for the initial estimate covariance    mathbfP(0) of model.\nσQ=0.1*ones(model.nx) : standard deviation vector for the process noise covariance    mathbfQ of model.\nσR=0.1*ones(length(i_ym)) : standard deviation vector for the sensor noise covariance    mathbfR of model measured outputs.\nnint_ym=fill(1,length(i_ym)) : integrator quantity per measured outputs for the    stochastic model, nint_ym=Int[] means no integrator at all.\nσP0_int=10*ones(sum(nint_ym)) : standard deviation vector for the initial estimate    covariance of the stochastic model (composed of output integrators).\nσQ_int=10*ones(sum(nint_ym)) : standard deviation vector for the process noise    covariance of the stochastic model (composed of output integrators).\n\n\n\n\n\n","category":"type"},{"location":"state_estim/#ModelPredictiveControl.updatestate!-Tuple{KalmanFilter, Any, Any, Any}","page":"State estimator design","title":"ModelPredictiveControl.updatestate!","text":"updatestate!(estim::KalmanFilter, u, ym, d=Float64[])\n\nUpdate estim.x̂P̂ estimates with current inputs u, measured outputs ym and dist. d.\n\n\n\n\n\n","category":"method"},{"location":"state_estim/#ModelPredictiveControl.evaloutput-Tuple{KalmanFilter, Any}","page":"State estimator design","title":"ModelPredictiveControl.evaloutput","text":"evaloutput(estim::KalmanFilter, d=Float64[])\n\nEvaluate KalmanFilter outputs ̂ŷ from estim.x̂ states and current disturbances d.\n\n\n\n\n\n","category":"method"},{"location":"state_estim/#UnscentedKalmanFilter","page":"State estimator design","title":"UnscentedKalmanFilter","text":"","category":"section"},{"location":"state_estim/#MovingHorizonEstimator","page":"State estimator design","title":"MovingHorizonEstimator","text":"","category":"section"},{"location":"state_estim/#Advanced-Topics","page":"State estimator design","title":"Advanced Topics","text":"","category":"section"},{"location":"state_estim/#Internals","page":"State estimator design","title":"Internals","text":"","category":"section"},{"location":"state_estim/","page":"State estimator design","title":"State estimator design","text":"ModelPredictiveControl.init_internalmodel\nModelPredictiveControl.init_estimstoch\nModelPredictiveControl.augment_model","category":"page"},{"location":"state_estim/#ModelPredictiveControl.init_internalmodel","page":"State estimator design","title":"ModelPredictiveControl.init_internalmodel","text":"init_internalmodel(As, Bs, Cs, Ds)\n\nCalc stochastic model update matrices Âs and B̂s for InternalModel estimator.\n\nAs, Bs, Cs and Ds are the stochastic model matrices :\n\nbeginaligned\n    mathbfx_s(k+1) = mathbfA_s x_s(k) + mathbfB_s e(k) \n    mathbfy_s(k)   = mathbfC_s x_s(k) + mathbfD_s e(k)\nendaligned\n\nwhere mathbfe(k) is conceptual and unknown zero mean white noise. Its optimal estimation is mathbfe=0, the expected value. Thus, the Âs and B̂s matrices that  optimally update the stochastic estimate mathbfx_s are:\n\nbeginaligned\n    mathbfx_s(k+1) \n        = mathbf(A_s - B_s D_s^-1 C_s) x_s(k) + mathbf(B_s D_s^-1) y_s(k) \n        = mathbfA_s x_s(k) + mathbfB_s y_s(k)\nendaligned\n\nwith current stochastic outputs estimation mathbfy_s(k), composed of the measured  mathbfy_s^m(k) = mathbfy^m(k) - mathbfy_d^m(k) and unmeasured  mathbfy_s^u = 0 outputs. See [1].\n\n[1]: Desbiens, A., D. Hodouin & É. Plamondon. 2000, \"Global predictive control : a unified control structure for decoupling setpoint tracking, feedforward compensation and  disturbance rejection dynamics\", IEE Proceedings - Control Theory and Applications,  vol. 147, no 4, https://doi.org/10.1049/ip-cta:20000443, p. 465–475, ISSN 1350-2379.\n\n\n\n\n\n","category":"function"},{"location":"state_estim/#ModelPredictiveControl.init_estimstoch","page":"State estimator design","title":"ModelPredictiveControl.init_estimstoch","text":"Asm, Csm = init_estimstoch(model::SimModel, i_ym, nint_ym)\n\nCalc stochastic model matrices from output integrators specifications for state estimation.\n\nFor closed-loop state estimators. nint_ym is a vector providing how many integrator should  be added for each measured output mathbfy^m. The argument generates the Asm and  Csm matrices:\n\nbeginaligned\nmathbfx_s(k+1) = mathbfA_s^m x_s(k) + mathbfB_s^m e(k) \nmathbfy_s^m(k) = mathbfC_s^m x_s(k)\nendaligned\n\nwhere mathbfe(k) is conceptual and unknown zero mean white noise. mathbfB_s^m is not used for closed-loop state estimators thus ignored.\n\n\n\n\n\n","category":"function"},{"location":"state_estim/#ModelPredictiveControl.augment_model","page":"State estimator design","title":"ModelPredictiveControl.augment_model","text":"augment_model(model::LinModel, As, Cs)\n\nAugment LinModel state-space matrices with the stochastic ones As and Cs.\n\nIf mathbfx_d are model.x states, and mathbfx_s, the states defined at init_estimstoch, we define an augmented state vector mathbfx =   beginsmallmatrix mathbfx_d  mathbfx_s endsmallmatrix . The function returns the augmented model matrices Â, B̂u, Ĉ, B̂d and D̂d:\n\nbeginaligned\n    mathbfx(k+1) = mathbfA x(k) + mathbfB_u u(k) + mathbfB_d d(k) \n    mathbfy(k)   = mathbfC x(k) + mathbfD_d d(k)\nendaligned\n\n\n\n\n\n","category":"function"},{"location":"sim_model/#Specifying-plant-models","page":"Specifying plant models","title":"Specifying plant models","text":"","category":"section"},{"location":"sim_model/","page":"Specifying plant models","title":"Specifying plant models","text":"adsasd","category":"page"},{"location":"sim_model/#SimModel-functions-and-types","page":"Specifying plant models","title":"SimModel functions and types","text":"","category":"section"},{"location":"sim_model/","page":"Specifying plant models","title":"Specifying plant models","text":"LinModel\nNonLinModel\nSimModel\nsetop!\nupdatestate!(::SimModel,::Any)\nevaloutput(::SimModel)","category":"page"},{"location":"sim_model/#ModelPredictiveControl.LinModel","page":"Specifying plant models","title":"ModelPredictiveControl.LinModel","text":"LinModel(sys::StateSpace[, Ts]; i_u=1:size(sys,2), i_d=Int[])\n\nConstruct a LinModel from state-space model sys with sampling time Ts in second.\n\nTs can be omitted when sys is discrete-time. Its state-space matrices are:\n\nbeginaligned\n    mathbfx(k+1) = mathbfA x(k) + mathbfB z(k) \n    mathbfy(k)   = mathbfC x(k) + mathbfD z(k)\nendaligned\n\nwith the state mathbfx and output mathbfy vectors. The mathbfz vector  comprises the manipulated inputs mathbfu and measured disturbances mathbfd,  in any order. i_u provides the indices of mathbfz that are manipulated, and i_d,  the measured disturbances. The state-space matrices are similar if sys is continuous-time  (replace x(k+1) with ẋ(t)). In such a case, it's discretized  with c2d and :zoh for manipulated inputs, and :tustin, for measured disturbances. \n\nThe constructor transforms the system to a more practical form (Dᵤ = 0 because of the  zero-order hold):\n\nbeginaligned\n    mathbfx(k+1) =  mathbfA x(k) + mathbfB_u u(k) + mathbfB_d d(k) \n    mathbfy(k)   =  mathbfC x(k) + mathbfD_d d(k)\nendaligned\n\nSee also ss, tf.\n\nExamples\n\njulia> model = LinModel(ss(0.4, 0.2, 0.3, 0, 0.1))\nDiscrete-time linear model with a sample time Ts = 0.1 s and:\n 1 manipulated inputs u\n 1 states x\n 1 outputs y\n 0 measured disturbances d\n\n\n\n\n\nLinModel(sys::TransferFunction[, Ts]; i_u=1:size(sys,2), i_d=Int[])\n\nConvert to minimal realization state-space when sys is a transfer function.\n\nsys is equal to fracmathbfy(s)mathbfz(s) for continuous-time, and  fracmathbfy(z)mathbfz(z), for discrete-time.\n\nExamples\n\njulia> model = LinModel([tf(3, [30, 1]) tf(-2, [5, 1])], 0.5, i_d=[2])\nDiscrete-time linear model with a sample time Ts = 0.5 s and:\n 1 manipulated inputs u\n 2 states x\n 1 outputs y\n 1 measured disturbances d\n\n\n\n\n\n","category":"type"},{"location":"sim_model/#ModelPredictiveControl.NonLinModel","page":"Specifying plant models","title":"ModelPredictiveControl.NonLinModel","text":"NonLinModel(f, h, Ts::Real, nu::Int, nx::Int, ny::Int, nd::Int=0)\n\nConstruct a NonLinModel from discrete-time state-space functions f and h.\n\nThe state update mathbff and output mathbfh functions are defined as :\n\n    beginaligned\n    mathbfx(k+1) = mathbffBig( mathbfx(k) mathbfu(k) mathbfd(k) Big) \n    mathbfy(k)   = mathbfhBig( mathbfx(k) mathbfd(k) Big)\n    endaligned\n\nTs is the sampling time in second. nu, nx, ny and nd are the respective number of  manipulated inputs, states, outputs and measured disturbances. \n\ntip: Tip\nReplace the d argument with _ if nd = 0 (see Examples below).  \n\nNonlinear continuous-time state-space functions are not supported for now. In such a case,  manually call a differential equation solver in the f function (e.g.: Euler method).\n\nSee also LinModel.\n\nExamples\n\njulia> model = NonLinModel((x,u,_)->-x+u, (x,_)->2x, 10, 1, 1, 1)\nDiscrete-time nonlinear model with a sample time Ts = 10.0 s and:\n 1 manipulated inputs u\n 1 states x\n 1 outputs y\n 0 measured disturbances d\n\n\n\n\n\n","category":"type"},{"location":"sim_model/#ModelPredictiveControl.SimModel","page":"Specifying plant models","title":"ModelPredictiveControl.SimModel","text":"Abstract supertype of LinModel and NonLinModel types.\n\n\n\n(model::SimModel)(d=Float64[])\n\nFunctor allowing callable SimModel object as an alias for evaloutput.\n\nExamples\n\njulia> model = NonLinModel((x,u,_)->-x + u, (x,_)->x .+ 20, 10, 1, 1, 1);\n\njulia> y = model()\n1-element Vector{Float64}:\n 20.0\n\n\n\n\n\n","category":"type"},{"location":"sim_model/#ModelPredictiveControl.setop!","page":"Specifying plant models","title":"ModelPredictiveControl.setop!","text":"setop!(model::SimModel; uop=Float64[], yop=Float64[], dop=Float64[])\n\nSet model inputs uop, outputs yop and measured disturbances dop operating points.\n\nThe state-space model including operating points (a.k.a. nominal values) is:\n\nbeginaligned\n    mathbfx(k+1) =  mathbfA x(k) + mathbfB_u u_0(k) + mathbfB_d d_0(k) \n    mathbfy_0(k) =  mathbfC x(k) + mathbfD_d d_0(k)\nendaligned\n\nwhere\n\nbeginaligned\n    mathbfu_0(k) = mathbfu(k) - mathbfu_op \n    mathbfy_0(k) = mathbfy(k) - mathbfy_op \n    mathbfd_0(k) = mathbfd(k) - mathbfd_op \nendaligned\n\nThe structure is similar if model is a NonLinModel:\n\nbeginaligned\n    mathbfx(k+1) = mathbffBig(mathbfx(k) mathbfu_0(k) mathbfd_0(k)Big)\n    mathbfy_0(k) = mathbfhBig(mathbfx(k) mathbfd_0(k)Big)\nendaligned\n\nExamples\n\njulia> model = setop!(LinModel(tf(3, [10, 1]), 2), uop=[50], yop=[20])\nDiscrete-time linear model with a sample time Ts = 2.0 s and:\n 1 manipulated inputs u\n 1 states x\n 1 outputs y\n 0 measured disturbances d\n\n\n\n\n\n","category":"function"},{"location":"sim_model/#ModelPredictiveControl.updatestate!-Tuple{SimModel, Any}","page":"Specifying plant models","title":"ModelPredictiveControl.updatestate!","text":"updatestate!(model::SimModel, u, d=Float64[])\n\nUpdate states x in model with current inputs u and measured disturbances d.\n\n\n\n\n\n","category":"method"},{"location":"sim_model/#ModelPredictiveControl.evaloutput-Tuple{SimModel}","page":"Specifying plant models","title":"ModelPredictiveControl.evaloutput","text":"evaloutput(model::SimModel, d=Float64[])\n\nEvaluate SimModel outputs y from model.x states and measured disturbances d.\n\n\n\n\n\n","category":"method"},{"location":"#ModelPredictiveControl.jl-Documentation","page":"ModelPredictiveControl.jl Documentation","title":"ModelPredictiveControl.jl Documentation","text":"","category":"section"},{"location":"","page":"ModelPredictiveControl.jl Documentation","title":"ModelPredictiveControl.jl Documentation","text":"","category":"page"},{"location":"#Tutorial","page":"ModelPredictiveControl.jl Documentation","title":"Tutorial","text":"","category":"section"},{"location":"","page":"ModelPredictiveControl.jl Documentation","title":"ModelPredictiveControl.jl Documentation","text":"asd ads.","category":"page"},{"location":"#API","page":"ModelPredictiveControl.jl Documentation","title":"API","text":"","category":"section"},{"location":"","page":"ModelPredictiveControl.jl Documentation","title":"ModelPredictiveControl.jl Documentation","text":"","category":"page"}]
}
