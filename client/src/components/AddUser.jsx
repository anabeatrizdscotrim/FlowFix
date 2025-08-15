import { Dialog } from "@headlessui/react";
import React from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { useRegisterMutation } from "../redux/slices/api/authApiSlice";
import { useUpdateUserMutation } from "../redux/slices/api/userApiSlice";
import { setCredentials } from "../redux/slices/authSlice";
import { Button, Loading, ModalWrapper, Textbox } from "./";

const AddUser = ({ open, setOpen, userData }) => {
  let defaultValues = userData ?? {};
  const { user } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues });

  const dispatch = useDispatch();

  const [addNewUser, { isLoading }] = useRegisterMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();

  const handleOnSubmit = async (data) => {
    try {
      if (userData) {
        const res = await updateUser(data).unwrap();
        toast.success(res?.message);
        if (userData?._id === user?._id) {
          dispatch(setCredentials({ ...res?.user }));
        }
      } else {
        const res = await addNewUser({
          ...data,
          password: data?.email,
        }).unwrap();
        toast.success("Usuário adicionado com sucesso");
      }

      setTimeout(() => {
        setOpen(false);
      }, 1500);
    } catch (err) {
      console.log(err);
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <>
      <ModalWrapper open={open} setOpen={setOpen}>
        <form onSubmit={handleSubmit(handleOnSubmit)} className=''>
          <Dialog.Title
            as='h2'
            className='text-base font-bold leading-6 text-gray-900 mb-4'
          >
            {userData ? "EDITAR PERFIL" : "ADICIONAR NOVO USUÁRIO"}
          </Dialog.Title>
          <div className='mt-2 flex flex-col gap-6'>
            <Textbox
              placeholder='Nome Completo'
              type='text'
              name='name'
              label='Nome Completo'
              className='w-full rounded'
              register={register("name", {
                required: "O nome é obrigatório!",
                    minLength: {
                    value: 3,
                    message: "O nome deve ter pelo menos 3 caracteres!",
                  },
              })}
              error={errors.name ? errors.name.message : ""}
            />
            <Textbox
              placeholder='Cargo'
              type='text'
              name='title'
              label='Cargo'
              className='w-full rounded'
              register={register("title", {
                required: "O cargo é obrigatório!",
                validate: (value) => value.trim() !== "" || "O cargo não pode estar vazio!",
              })}
              error={errors.title ? errors.title.message : ""}
            />
            <Textbox
              placeholder='Email'
              type='email'
              name='email'
              label='Email'
              className='w-full rounded'
              register={register("email", {
                required: "O email é obrigatório!",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Digite um email válido!",
                  },
              })}
              error={errors.email ? errors.email.message : ""}
            />

            <Textbox
              placeholder='Tipo de Usuário'
              type='text'
              name='role'
              label='Tipo de Usuário'
              className='w-full rounded'
              register={register("role", {
                required: "O tipo é obrigatório!",
                validate: (value) => value.trim() !== "" || "O tipo não pode estar vazio!",
              })}
              error={errors.role ? errors.role.message : ""}
            />
          </div>

          {isLoading || isUpdating ? (
            <div className='py-5'>
              <Loading />
            </div>
          ) : (
            <div className='py-3 mt-4 sm:flex sm:flex-row-reverse'>
              <Button
                type='submit'
                className='bg-blue-400 px-4 text-sm font-semibold text-white hover:bg-blue-200  sm:w-auto'
                label='Enviar'
              />

              <Button
                type='button'
                className= 'px-4 text-sm font-semibold text-gray-700 sm:w-auto ml'
                onClick={() => setOpen(false)}
                label='Cancelar'
              />
            </div>
          )}
        </form>
      </ModalWrapper>
    </>
  );
};

export default AddUser;
