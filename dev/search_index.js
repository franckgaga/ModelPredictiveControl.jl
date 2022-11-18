var documenterSearchIndex = {"docs":
[{"location":"#ModelPredictiveControl.jl-Documentation","page":"Home","title":"ModelPredictiveControl.jl Documentation","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"","category":"page"},{"location":"#Tutorial","page":"Home","title":"Tutorial","text":"","category":"section"},{"location":"#Specifying-models","page":"Home","title":"Specifying models","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"adsasd","category":"page"},{"location":"#SimModel-functions","page":"Home","title":"SimModel functions","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"LinModel\nNonLinModel\nsetop!\nupdatestate\nevaloutput","category":"page"},{"location":"#ModelPredictiveControl.LinModel","page":"Home","title":"ModelPredictiveControl.LinModel","text":"LinModel(sys::StateSpace[, Ts]; i_u=1:size(sys,2), i_d=Int[])\n\nConstruct a LinModel from state-space model sys with sampling time Ts in second.\n\nTs can be omitted when sys is discrete-time. Its state-space matrices are:\n\nbeginaligned\n    mathbfx(k+1) = mathbfA x(k) + mathbfB z(k) \n    mathbfy(k)   = mathbfC x(k) + mathbfD z(k)\nendaligned\n\nwith the state mathbfx and output mathbfy vectors. The mathbfz vector  comprises the manipulated inputs mathbfu and measured disturbances mathbfd,  in any order. i_u provides the indices of mathbfz that are manipulated, and i_d,  the measured disturbances. The state-space matrices are similar if sys is continuous-time  (replace x(k+1) with ẋ(t)). In such a case, it's discretized  with c2d and :zoh for manipulated inputs, and :tustin, for measured disturbances. \n\nThe constructor transforms the system to a more practical form (Dᵤ = 0 because of the  zero-order hold):\n\nbeginaligned\n    mathbfx(k+1) =  mathbfA x(k) + mathbfB_u u(k) + mathbfB_d d(k) \n    mathbfy(k)   =  mathbfC x(k) + mathbfD_d d(k)\nendaligned\n\nSee also ss, tf.\n\nExamples\n\njulia> model = LinModel(ss(0.4, 0.2, 0.3, 0, 0.1))\nDiscrete-time linear model with a sample time Ts = 0.1 s and:\n 1 manipulated inputs u\n 1 states x\n 1 outputs y\n 0 measured disturbances d\n\n\n\n\n\nLinModel(sys::TransferFunction[, Ts]; i_u=1:size(sys,2), i_d=Int[])\n\nConvert to minimal realization state-space when sys is a transfer function.\n\nsys is equal to fracmathbfy(s)mathbfz(s) for continuous-time, and  fracmathbfy(z)mathbfz(z), for discrete-time.\n\nExamples\n\njulia> model = LinModel([tf(3, [30, 1]) tf(-2, [5, 1])], 0.5, i_d=[2])\nDiscrete-time linear model with a sample time Ts = 0.5 s and:\n 1 manipulated inputs u\n 2 states x\n 1 outputs y\n 1 measured disturbances d\n\n\n\n\n\n","category":"type"},{"location":"#ModelPredictiveControl.NonLinModel","page":"Home","title":"ModelPredictiveControl.NonLinModel","text":"NonLinModel(f, h, Ts::Real, nu::Int, nx::Int, ny::Int, nd::Int=0)\n\nConstruct a NonLinModel from discrete-time state-space functions f and h.\n\nThe state update mathbff and output mathbfh functions are defined as :\n\n    beginaligned\n    mathbfx(k+1) = mathbffBig( mathbfx(k) mathbfu(k) mathbfd(k) Big) \n    mathbfy(k)   = mathbfhBig( mathbfx(k) mathbfd(k) Big)\n    endaligned\n\nTs is the sampling time in second. nu, nx, ny and nd are the respective number of  manipulated inputs, states, outputs and measured disturbances. \n\ntip: Tip\nReplace the d argument with _ if nd = 0 (see Examples below).  \n\nNonlinear continuous-time state-space functions are not supported for now. In such a case,  manually call a differential equation solver in the f function (e.g.: Euler method).\n\nSee also LinModel.\n\nExamples\n\njulia> model = NonLinModel((x,u,_)->-x+u, (x,_)->2x, 10, 1 , 1 , 1)\nDiscrete-time nonlinear model with a sample time Ts = 10.0 s and:\n 1 manipulated inputs u\n 1 states x\n 1 outputs y\n 0 measured disturbances d\n\n\n\n\n\n","category":"type"},{"location":"#ModelPredictiveControl.setop!","page":"Home","title":"ModelPredictiveControl.setop!","text":"setop!(model::SimModel; uop=Float64[], yop=Float64[], dop=Float64[])\n\nSet model inputs uop, outputs yop and measured disturbances dop operating points.\n\nThe state-space model including operating points (a.k.a. nominal values) is:\n\nbeginaligned\n    mathbfx(k+1) =  mathbfA x(k) + mathbfB_u u_0(k) + mathbfB_d d_0(k) \n    mathbfy_0(k) =  mathbfC x(k) + mathbfD_d d_0(k)\nendaligned\n\nwhere\n\nbeginaligned\n    mathbfu_0(k) = mathbfu(k) - mathbfu_op(k) \n    mathbfy_0(k) = mathbfy(k) - mathbfy_op(k) \n    mathbfd_0(k) = mathbfd(k) - mathbfd_op(k) \nendaligned\n\nThe structure is similar if model is a NonLinModel:\n\nbeginaligned\n    mathbfx(k+1) = mathbffBig(mathbfx(k) mathbfu_0(k) mathbfd_0(k)Big)\n    mathbfy_0(k) = mathbfhBig(mathbfx(k) mathbfd_0(k)Big)\nendaligned\n\nExamples\n\njulia> model = setop!(LinModel(tf(3, [10, 1]), 2), uop=[50], yop=[20])\nDiscrete-time linear model with a sample time Ts = 2.0 s and:\n 1 manipulated inputs u\n 1 states x\n 1 outputs y\n 0 measured disturbances d\n\n\n\n\n\n","category":"function"},{"location":"#ModelPredictiveControl.evaloutput","page":"Home","title":"ModelPredictiveControl.evaloutput","text":"Evaluate output y of model with current states x and measured disturbances d.\n\n\n\n\n\n","category":"function"},{"location":"#State-estimator-design","page":"Home","title":"State estimator design","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"info: Info\nAll the state estimators support measured mathbfy^m and unmeasured  mathbfy^u model outputs, where mathbfy refers to all of them.","category":"page"},{"location":"#StateEstimator-functions","page":"Home","title":"StateEstimator functions","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"InternalModel","category":"page"},{"location":"#ModelPredictiveControl.InternalModel","page":"Home","title":"ModelPredictiveControl.InternalModel","text":"InternalModel(model::SimModel; i_ym=1:model.ny, stoch_ym=ss(1,1,1,1,model.Ts).*I)\n\nConstruct an InternalModel estimator based on model.\n\ni_ym provides the model output indices that are measured mathbfy^m, the rest are  unmeasured mathbfy^u. model evaluates the deterministic predictions  mathbfy_d, and stoch_ym, the stochastic predictions of the measured outputs  mathbfy_s^m, the unmeasured ones being mathbfy_s^u = mathbf0. \n\nstoch_ym is a TransferFunction or StateSpace model that hypothetically filters a zero  mean white noise vector. Its default value supposes 1 integrator per measured outputs,  assuming that the current stochastic estimate mathbfy_s^m(k) = mathbfy^m(k) -  mathbfy_d^m(k) will be constant in the future. This is the dynamic matrix control (DMC)  strategy, which is simple but sometimes too aggressive. Additional poles and zeros in  stoch_ym can mitigate this.\n\nwarning: Warning\nInternalModel estimator does not work if model is integrating or unstable. The  constructor verifies these aspects for LinModel but not for NonLinModel. Uses any  other state estimator in such cases.\n\nSee also init_internalmodel\n\nExamples\n\njulia> estim = InternalModel(LinModel([tf(3, [30, 1]); tf(-2, [5, 1])], 0.5), i_ym=[2])\nInternalModel state estimator with a sample time Ts = 0.5 s and:\n 1 manipulated inputs u\n 2 states x̂\n 1 measured outputs ym\n 1 unmeasured outputs yu\n 0 measured disturbances d\n\n\n\n\n\n","category":"type"},{"location":"#Advanced-Topics","page":"Home","title":"Advanced Topics","text":"","category":"section"},{"location":"#Internals","page":"Home","title":"Internals","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"ModelPredictiveControl.init_internalmodel","category":"page"},{"location":"#ModelPredictiveControl.init_internalmodel","page":"Home","title":"ModelPredictiveControl.init_internalmodel","text":"init_internalmodel(As, Bs, Cs, Ds)\n\nCalc stochastic model update matrices Âs and B̂s for InternalModel estimator.\n\nÂs and B̂s are the stochastic model update matrices :\n\n    mathbfx_s(k+1) =  mathbfA_s x_s(k) + mathbfB_s y_s(k)\n\nwith current stochastic model states mathbfx_s(k) and outputs mathbfy_s(k),  which is in turn composed of the measured mathbfy_s^m(k) = mathbfy^m(k) -  mathbfy_d^m(k) and unmeasured mathbfy_s^u = 0 outputs. See [1].\n\n[1]: Desbiens, A., D. Hodouin & É. Plamondon. 2000, \"Global predictive control : a unified control structure for decoupling setpoint tracking, feedforward compensation and  disturbance rejection dynamics\", IEE Proceedings - Control Theory and Applications,  vol. 147, no 4, https://doi.org/10.1049/ip-cta:20000443, p. 465–475, ISSN 1350-2379.\n\n\n\n\n\n","category":"function"},{"location":"#API","page":"Home","title":"API","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"","category":"page"}]
}
