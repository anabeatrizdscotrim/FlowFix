import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button, Loading, Textbox } from "../components";
import { useLoginMutation } from "../redux/slices/api/authApiSlice";
import { setCredentials } from "../redux/slices/authSlice";
import { useEffect } from "react";
import React from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

const Login = () => {
  const { user } = useSelector((state) => state.auth);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [login, { isLoading }] = useLoginMutation();

  const handleLogin = async (data) => {
    try {
      const res = await login(data).unwrap();

      dispatch(setCredentials(res));
      navigate("/");
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  const [showPassword, setShowPassword] = React.useState(false);

  useEffect(() => {
    user && navigate("/dashboard");
  }, [user]);

  return (
    <div className='w-full min-h-screen flex items-center justify-center flex-col lg:flex-row bg-[#f3f4f6] dark:bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#302943] via-slate-900 to-black'>
      <div className='w-full md:w-auto flex gap-0 md:gap-40 flex-col md:flex-row items-center justify-center'>
        <div className='h-full w-full lg:w-2/3 flex flex-col items-center justify-center'>
          <div className='w-full md:max-w-lg 2xl:max-w-3xl flex flex-col items-center justify-center gap-5 md:gap-y-10 2xl:-mt-20'>
            <span className='flex gap-1 py-1 px-3 border rounded-full text-sm md:text-base dark:border-gray-700 dark:text-blue-400 border-gray-300 text-gray-600'>
              Administre todas as suas tarefas em um só lugar!
            </span>
            <p className='flex flex-col gap-0 md:gap-4 text-4xl md:text-6xl 2xl:text-7xl font-black text-center dark:text-gray-400 text-black-700'>
              <span>Ibimotos</span>
              <span className='text-blue-400'>FlowFix</span>
            </p>
          </div>
        </div>

        <div className='w-full md:w-1/3 p-4 md:p-1 flex flex-col justify-center items-center'>
          <form
            onSubmit={handleSubmit(handleLogin)}
            className='form-container w-full md:w-[400px] flex flex-col gap-y-8 bg-white dark:bg-slate-900 px-10 pt-14 pb-14'
          >
            <div>
              <p className='text-black-600 text-3xl font-bold text-center'>
                Bem-vindo!
              </p>
              <p className='text-center text-base text-gray-700 dark:text-gray-500'>
                Mantenha todas as suas credenciais seguras
              </p>
            </div>
            <div className='flex flex-col gap-y-5'>
             <div className="flex flex-col gap-y-5 relative">
            <Textbox
              placeholder="email@example.com"
              type="email"
              name="email"
              label="E-mail"
              className="w-full rounded-full"
              register={register("email", {
                required: "O endereço de e-mail é obrigatório!",
                pattern: {
                  value: /^\S+@\S+\.\S+$/,
                  message: "Formato de e-mail inválido!",
                },
              })}
              error={errors.email ? errors.email.message : ""}
            />

            <div className="relative">
              <Textbox
                placeholder="Sua senha"
                type={showPassword ? "text" : "password"}
                name="password"
                label="Senha"
                className="w-full"
                register={register("password", {
                  required: "A senha é obrigatória!",
                  minLength: {
                    value: 6,
                    message: "A senha deve ter pelo menos 6 caracteres!",
                  },
                })}
                error={errors.password ? errors.password.message : ""}
              />

              <div
                className="absolute right-3 top-9 cursor-pointer text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
              </div>
            </div>
          </div>

          <span className="text-sm text-gray-600 hover:text-blue-400 hover:underline cursor-pointer">
            Esqueceu a senha?
          </span>
            </div>
            {isLoading ? (
              <Loading />
            ) : (
              <Button
                type='submit'
                label='Login'
                className='w-full h-10 bg-blue-400 text-white rounded-full'
                disabled={Object.keys(errors).length > 0}
              />
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;