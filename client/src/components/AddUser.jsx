import { Dialog } from "@headlessui/react";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { useRegisterMutation } from "../redux/slices/api/authApiSlice";
import { useUpdateUserMutation } from "../redux/slices/api/userApiSlice";
import { setCredentials } from "../redux/slices/authSlice";
import { Button, Loading, ModalWrapper, Textbox } from "./";

const AddUser = ({ open, setOpen, userData }) => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const isEditing = Boolean(userData?._id);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: { name: "", title: "", email: "" },
  });

  const [isAdmin, setIsAdmin] = useState(false);
  const [isUser, setIsUser] = useState(true);

  const [addNewUser, { isLoading }] = useRegisterMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();

  useEffect(() => {
    if (!open) return;

    if (isEditing) {
      reset({
        name: userData?.name || "",
        title: userData?.title || "",
        email: userData?.email || "",
      });
      setIsAdmin(!!userData?.isAdmin);
      setIsUser(!userData?.isAdmin);
    } else {
      reset({ name: "", title: "", email: "" });
      setIsAdmin(false);
      setIsUser(true);
    }
  }, [open, isEditing, userData, reset]);

  const handleClose = () => {
    reset({ name: "", title: "", email: "" });
    setIsAdmin(false);
    setIsUser(true);
    setOpen(false);
  };

  const generateRandomPassword = (length = 10) => {
    const chars =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleOnSubmit = async (data) => {
    const role = isAdmin ? "Administrador" : "Usuário Comum";
    const password = generateRandomPassword();

    try {
      if (isEditing) {
        const res = await updateUser({
        _id: userData._id,
        ...data,
        isAdmin,
        role
      }).unwrap();
        toast.success(res?.message || "Perfil atualizado com sucesso!")
        if (userData?._id === user?._id) {
          dispatch(setCredentials({ ...res?.user }));
        }
      } else {
        const res = await addNewUser({
          ...data,
          password,
          isAdmin,
          role,
          firstLogin: true,
        }).unwrap();
        toast.success(
          res?.message ||
            `Usuário adicionado com sucesso! Senha inicial: ${password}`
        );
      }
      setTimeout(() => {
        handleClose();
      }, 800);
    } catch (err) {
      console.log(err);
      toast.error(err?.data?.message || err.error || "Erro inesperado.");
    }
  };

  return (
    <ModalWrapper open={open} setOpen={setOpen}>
      <form onSubmit={handleSubmit(handleOnSubmit)} className=''>
        <Dialog.Title
          as='h2'
          className='text-base font-bold leading-6 text-gray-900 mb-4'
        >
          {isEditing ? "EDITAR PERFIL" : "ADICIONAR NOVO USUÁRIO"}
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
              minLength: { value: 3, message: "Mínimo de 3 caracteres!" },
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
              validate: (value) =>
                value.trim() !== "" || "O cargo não pode estar vazio!",
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

          {user?.isAdmin && (
            <div className='flex flex-col gap-2'>
              <label className='flex items-center gap-2'>
                <input
                  type='checkbox'
                  checked={isAdmin}
                  onChange={(e) => {
                    setIsAdmin(e.target.checked);
                    setIsUser(!e.target.checked);
                  }}
                  className='w-4 h-4 border-black accent-black'
                />
                Administrador
              </label>

              <label className='flex items-center gap-2'>
                <input
                  type='checkbox'
                  checked={isUser}
                  onChange={(e) => {
                    setIsUser(e.target.checked);
                    setIsAdmin(!e.target.checked);
                  }}
                  className='w-4 h-4 border-black accent-black'
                />
                Usuário Comum
              </label>
            </div>
          )}
        </div>

        {isLoading || isUpdating ? (
          <div className='py-5'>
            <Loading />
          </div>
        ) : (
          <div className='py-3 mt-4 sm:flex sm:flex-row-reverse'>
            <Button
              type='submit'
              className='bg-blue-400 px-4 text-sm font-semibold text-white hover:bg-blue-200 sm:w-auto'
              label='Enviar'
            />

            <Button
              type='button'
              className='px-4 text-sm font-semibold text-gray-700 sm:w-auto ml-2'
              onClick={handleClose}
              label='Cancelar'
            />
          </div>
        )}
      </form>
    </ModalWrapper>
  );
};

export default AddUser;
