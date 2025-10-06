import { Dialog } from "@headlessui/react";
import React, {useEffect} from "react";
import { useForm } from "react-hook-form";
import Button from "./Button";
import Loading from "./Loading";
import ModalWrapper from "./ModalWrapper";
import Textbox from "./Textbox";
import { useChangePasswordMutation } from "../redux/slices/api/userApiSlice";
import { toast } from "sonner";


const ChangePassword = ({ open, setOpen }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const [changeUserPassword, { isLoading }] = useChangePasswordMutation();

  const handleOnSubmit = async (data) => {
    if (data.password !== data.cpass) {
      toast.warning("As senhas não são iguais!");
      return;
    }
    try {
      const res = await changeUserPassword(data).unwrap();
      toast.success("Senha alterada com sucessso!");

      setTimeout(() => {
        setOpen(false);
        reset();
      }, 1500);
    } catch (err) {
      console.log(err);
      toast.error(err?.data?.message || err.error);
    }
  };

  useEffect(() => {
    if(!open){
      reset();
    }
  }, [open, reset]);

  return (
    <>
      <ModalWrapper open={open} setOpen={setOpen}>
        <form onSubmit={handleSubmit(handleOnSubmit)} className=''>
          <Dialog.Title
            as='h2'
            className='text-base font-bold leading-6 text-gray-900 mb-4'
          >
            Mudar Senha
          </Dialog.Title>
          <div className='mt-2 flex flex-col gap-6'>
            <Textbox
              placeholder='Nova Senha'
              type='password'
              name='password'
              label='Nova Senha'
              className='w-full rounded'
              register={register("password", {
                required: "Digite a nova senha!",
              })}
              error={errors.password ? errors.password.message : ""}
            />
            <Textbox
              placeholder='Confirme a nova senha'
              type='password'
              name='cpass'
              label='Confirme a nova senha'
              className='w-full rounded'
              register={register("cpass", {
                required: "Confirme a nova senha!",
              })}
              error={errors.cpass ? errors.cpass.message : ""}
            />
          </div>

          {isLoading ? (
            <div className='py-5'>
              <Loading />
            </div>
          ) : (
            <div className='py-3 mt-4 sm:flex sm:flex-row-reverse'>
              <Button
                type='submit'
                className='bg-blue-600 px-8 text-sm font-semibold text-white hover:bg-blue-700  sm:w-auto'
                label='Salvar'
              />

              <button
                type='button'
                className='bg-white px-5 text-sm font-semibold text-gray-900 sm:w-auto'
                onClick={() => setOpen(false)}
              >
                Cancelar
              </button>
            </div>
          )}
        </form>
      </ModalWrapper>
    </>
  );
};

export default ChangePassword;
