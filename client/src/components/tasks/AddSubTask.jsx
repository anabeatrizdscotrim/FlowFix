import { Dialog } from "@headlessui/react";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { useCreateSubTaskMutation, useUpdateSubTaskMutation } from "../../redux/slices/api/taskApiSlice";
import Button from "../Button";
import Loading from "../Loading";
import ModalWrapper from "../ModalWrapper";
import Textbox from "../Textbox";

const AddSubTask = ({ open, setOpen, id, subTask, onSuccess }) => {

  const defaultValues = {
    title: subTask?.title || "",
    date: subTask?.date ? subTask.date.split("T")[0] : "",
    tag: subTask?.tag || "",
  };

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm({ defaultValues });

  const [addSbTask, { isLoading }] = useCreateSubTaskMutation();
  const [updateSubTask, {isLoading: isUpdating}] = useUpdateSubTaskMutation();

 useEffect(() => {
    if (subTask) {
      setValue("title", subTask.title);
      setValue("date", subTask.date ? subTask.date.split("T")[0] : "");
      setValue("tag", subTask.tag || "");
    } else {
      reset(defaultValues);
    }
  }, [subTask, open, reset, setValue]);

  const handleCancel = () => {
    reset(defaultValues);
    setOpen(false);
  };

  const handleOnSubmit = async (data) => {
    
    try {
    const [year, month, day] = data.date.split("-");
    const selectedDate = new Date(year, month - 1, day); 

    const newData = {
      ...data,
      date: selectedDate,
    };

    const res = subTask
    ? await updateSubTask({
        taskId: id,
        subTaskId: subTask._id,
        title: newData.title,
        tag: newData.tag,
        date: newData.date,
      }).unwrap()
    : await addSbTask({ data: newData, id }).unwrap();


    toast.success(res.message);
      onSuccess?.();
      handleCancel();
      if (onSuccess) onSuccess();
    } catch (err) {
      console.log(err);
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <>
      <ModalWrapper open={open} setOpen={setOpen}>
        <form onSubmit={handleSubmit(handleOnSubmit)} className=''>
           <Dialog.Title className="text-base font-bold leading-6 text-gray-900 mb-4">
              {subTask ? "EDITAR SUBTAREFA" : "ADICIONAR SUBTAREFA"}
           </Dialog.Title>
          <div className='mt-2 flex flex-col gap-6'>
            <Textbox
              placeholder='Título da Subtarefa'
              type='text'
              name='title'
              label='Título'
              className='w-full rounded'
              register={register("title", {
                required: "O título é obrigatório",
              })}
              error={errors.title ? errors.title.message : ""}
            />

            <div className='flex items-center gap-4'>
              <Textbox
                placeholder='Date'
                type='date'
                name='date'
                label='Data'
                className='w-full rounded'
                register={register("date", {
                  required: "A data é obrigatória!",
                })}
                error={errors.date ? errors.date.message : ""}
              />
              <Textbox
                placeholder='Tag'
                type='text'
                name='tag'
                label='Tag'
                className='w-full rounded'
                register={register("tag", {
                  required: "A tag é obrigatória!",
                })}
                error={errors.tag ? errors.tag.message : ""}
              />
            </div>
          </div>
          {(isLoading || isUpdating) ? (
            <div className='mt-8'>
              <Loading />
            </div>
          ) : (
            <div className='py-3 mt-4 flex sm:flex-row-reverse gap-4'>
              <Button
                type='submit'
                className='bg-blue-400 text-sm font-semibold text-white hover:bg-blue-200 sm:ml-3 sm:w-auto'
                label={subTask ? "Salvar" : "Adicionar"}
              />

              <Button
                type='button'
                className='bg-red-400 text-sm font-semibold text-white hover:bg-red-200 sm:ml-3 sm:w-auto'
                onClick={handleCancel}
                label='Cancelar'
              />
            </div>
          )}
        </form>
      </ModalWrapper>
    </>
  );
};

export default AddSubTask;
