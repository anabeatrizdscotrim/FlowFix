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

  // usamos um único estado role para evitar inconsistências
  const [role, setRole] = useState("Usuário Comum"); // valores: "Usuário Comum" | "Administrador"

  const [addNewUser, { isLoading }] = useRegisterMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();

  // função utilitária: interpreta vários formatos possíveis para isAdmin vindo do back
  const detectIsAdminFromUserData = (ud) => {
    if (!ud) return false;
    // verifica booleano estrito
    if (ud.isAdmin === true) return true;
    // aceitar strings/nums que representem true
    const isAdminField = String(ud.isAdmin ?? "").toLowerCase();
    if (["true", "1", "yes"].includes(isAdminField)) return true;

    // verifica role/string que contenha 'admin'
    const roleField = String(ud.role ?? "").toLowerCase();
    if (roleField.includes("admin")) return true;
    if (roleField.includes("administrador")) return true;
    if (roleField.includes("administrator")) return true;

    return false;
  };

  useEffect(() => {
    // atualiza sempre que o modal abre OU quando userData muda
    if (!open) return;

    if (isEditing && userData) {
      reset({
        name: userData?.name || "",
        title: userData?.title || "",
        email: userData?.email || "",
      });

      const isAdminDetected = detectIsAdminFromUserData(userData);
      setRole(isAdminDetected ? "Administrador" : "Usuário Comum");
    } else {
      // criando novo usuário — estado padrão
      reset({ name: "", title: "", email: "" });
      setRole("Usuário Comum");
    }
  }, [open, isEditing, userData, reset]);

  const handleClose = () => {
    reset({ name: "", title: "", email: "" });
    setRole("Usuário Comum");
    setOpen(false);
  };

  const handleOnSubmit = async (data) => {
    const isAdmin = role === "Administrador";
    const roleLabel = isAdmin ? "Administrador" : "Usuário Comum";

    try {
      if (isEditing) {
        const res = await updateUser({
          _id: userData._id,
          ...data,
          isAdmin,
          role: roleLabel,
        }).unwrap();

        toast.success(res?.message || "Perfil atualizado com sucesso!");

        // atualiza as credenciais caso o próprio usuário tenha alterado seu perfil
        if (userData?._id === user?._id) {
          dispatch(setCredentials({ ...res?.user }));
        }
      } else {
        const res = await addNewUser({
          ...data,
          isAdmin,
          role: roleLabel,
        }).unwrap();

        toast.success(
          res?.message ||
            "Usuário criado! Um e-mail foi enviado com as credenciais."
        );
      }

      setTimeout(() => {
        handleClose();
      }, 600);
    } catch (err) {
      console.error(err);
      toast.error(err?.data?.message || err.error || "Erro inesperado.");
    }
  };

  return (
    <ModalWrapper open={open} setOpen={setOpen}>
      <form onSubmit={handleSubmit(handleOnSubmit)}>
        <Dialog.Title
          as="h2"
          className="text-base font-bold leading-6 text-gray-900 mb-4"
        >
          {isEditing ? "EDITAR PERFIL" : "ADICIONAR NOVO USUÁRIO"}
        </Dialog.Title>

        <div className="mt-2 flex flex-col gap-6">
          <Textbox
            placeholder="Nome Completo"
            type="text"
            name="name"
            label="Nome Completo"
            className="w-full rounded"
            register={register("name", {
              required: "O nome é obrigatório!",
              minLength: { value: 3, message: "Mínimo de 3 caracteres!" },
            })}
            error={errors.name ? errors.name.message : ""}
          />

          <Textbox
            placeholder="Cargo"
            type="text"
            name="title"
            label="Cargo"
            className="w-full rounded"
            register={register("title", {
              required: "O cargo é obrigatório!",
              validate: (value) =>
                value.trim() !== "" || "O cargo não pode estar vazio!",
            })}
            error={errors.title ? errors.title.message : ""}
          />

          <Textbox
            placeholder="Email"
            type="email"
            name="email"
            label="Email"
            className="w-full rounded"
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
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium">Tipo de usuário</span>

              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="role"
                  value="Usuário Comum"
                  checked={role === "Usuário Comum"}
                  onChange={() => setRole("Usuário Comum")}
                  className="w-4 h-4 border-black accent-black"
                />
                Usuário Comum
              </label>

              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="role"
                  value="Administrador"
                  checked={role === "Administrador"}
                  onChange={() => setRole("Administrador")}
                  className="w-4 h-4 border-black accent-black"
                />
                Administrador
              </label>
            </div>
          )}
        </div>

        {isLoading || isUpdating ? (
          <div className="py-5">
            <Loading />
          </div>
        ) : (
          <div className="py-3 mt-4 sm:flex sm:flex-row-reverse">
            <Button
              type="submit"
              className="bg-blue-400 px-4 text-sm font-semibold text-white hover:bg-blue-200 sm:w-auto"
              label="Enviar"
            />

            <Button
              type="button"
              className="px-4 text-sm font-semibold text-gray-700 sm:w-auto ml-2"
              onClick={handleClose}
              label="Cancelar"
            />
          </div>
        )}
      </form>
    </ModalWrapper>
  );
};

export default AddUser;
