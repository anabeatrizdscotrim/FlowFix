import { Dialog } from "@headlessui/react";
import clsx from "clsx";
import { PiSealQuestionLight } from "react-icons/pi";
import { Button, ModalWrapper } from "./";

export default function ConfirmatioDialog({
  open,
  setOpen,
  msg,
  onClick = () => {},
  type = "delete",
  setMsg = () => {},
  setType = () => {},
}) {
  const closeDialog = () => {
    setType("delete");
    setMsg(null);
    setOpen(false);
  };

  return (
    <>
      <ModalWrapper open={open} setOpen={closeDialog}>
        <div className='py-4 w-full flex flex-col gap-4 items-center justify-center'>
          <Dialog.Title as='h3' className=''>
            <p
              className={clsx(
                type === "restore" || type === "restoreAll"
                  ? "text-green-500 "
                  : "text-red-500" 
              )}
            >
              <PiSealQuestionLight size={80} />
            </p>
          </Dialog.Title>

          <p className='text-center text-gray-700'>
            {msg ?? "Tem certeza de que deseja deletar o item selecionado?"}
          </p>

          <div className='bg-white py-3 sm:flex sm:flex-row-reverse gap-4'>
            <Button
              type='button'
              className={clsx(
                " px-8 text-sm font-semibold text-white sm:w-auto",
                type === "restore" || type === "restoreAll"
                  ? "bg-green-400 hover:bg-green-300"
                  : "bg-red-400 hover:bg-red-300"
              )}
              onClick={onClick}
              label={type === "restore" ? "Restaurar" : "Deletar"}
            />

            <Button
              type='button'
              className='bg-white px-8 text-sm font-semibold text-gray-900 sm:w-auto border'
              onClick={() => closeDialog()}
              label='Cancelar'
            />
          </div>
        </div>
      </ModalWrapper>
    </>
  );
}

export function UserAction({ open, setOpen, onClick = () => {} }) {
  const closeDialog = () => {
    setOpen(false);
  };

  return (
    <>
      <ModalWrapper open={open} setOpen={closeDialog}>
        <div className='py-4 w-full flex flex-col gap-4 items-center justify-center'>
          <Dialog.Title as='h3' className=''>
            <p className={clsx("text-red-500")}>
              <PiSealQuestionLight size={80} />
            </p>
          </Dialog.Title>

          <p className='text-center text-gray-700'>
            {"Tem certeza de que deseja ativar ou desativar esta conta?"}
          </p>

          <div className='bg-gray-white py-3 sm:flex sm:flex-row-reverse gap-4'>
            <Button
              type='button'
              className={clsx(
                " px-8 text-sm font-semibold text-white sm:w-auto",
                "bg-red-400 hover:bg-red-300"
              )}
              onClick={onClick}
              label={"Sim"}
            />

            <Button
              type='button'
              className='bg-white px-8 text-sm font-semibold text-gray-900 sm:w-auto border'
              onClick={() => closeDialog()}
              label='Não'
            />
          </div>
        </div>
      </ModalWrapper>
    </>
  );
}
