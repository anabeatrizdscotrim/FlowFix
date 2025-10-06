import { Dialog } from "@headlessui/react";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { useState, useEffect} from "react";
import { useForm } from "react-hook-form";
import { BiImages } from "react-icons/bi";
import { toast } from "sonner";

import {
  useCreateTaskMutation,
  useUpdateTaskMutation,
} from "../../redux/slices/api/taskApiSlice";
import { dateFormatter } from "../../utils";
import { app } from "../../utils/firebase";
import Button from "../Button";
import Loading from "../Loading";
import ModalWrapper from "../ModalWrapper";
import SelectList from "../SelectList";
import Textbox from "../Textbox";
import UserList from "./UsersSelect";

const LISTS = ["TODO", "IN PROGRESS", "COMPLETED"];
const PRIORIRY = ["HIGH", "MEDIUM", "NORMAL", "LOW"];

const STATUS_PT_BR = {
  "TODO": "Para Fazer",
  "IN PROGRESS": "Em Progresso",
  "COMPLETED": "Finalizado",
};

const PRIORITY_PT_BR = {
  "HIGH": "Alta",
  "MEDIUM": "Média",
  "NORMAL": "Normal",
  "LOW": "Baixa",
};

const uploadedFileURLs = [];

const uploadFile = async (file) => {
  const storage = getStorage(app);

  const name = new Date().getTime() + file.name;
  const storageRef = ref(storage, name);

  const uploadTask = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        console.log("Uploading");
      },
      (error) => {
        reject(error);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref)
          .then((downloadURL) => {
            uploadedFileURLs.push(downloadURL);
            resolve();
          })
          .catch((error) => {
            reject(error);
          });
      }
    );
  });
};

const AddTask = ({ open, setOpen, task }) => {
  const defaultValues = {
    title: task?.title || "",
    date: dateFormatter(task?.date || new Date()),
    team: [],
    stage: "",
    priority: "",
    assets: [],
    description: "",
    links: "",
  };
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({ defaultValues });

  const [stage, setStage] = useState(task?.stage?.toUpperCase() || LISTS[0]);
  const [team, setTeam] = useState(task?.team?.length > 0 ? task.team : []);
  const [priority, setPriority] = useState(
    task?.priority?.toUpperCase() || PRIORIRY[2]
  );
  const [assets, setAssets] = useState([]);
  const [uploading, setUploading] = useState(false);

  const [createTask, { isLoading }] = useCreateTaskMutation();
  const [updateTask, { isLoading: isUpdating }] = useUpdateTaskMutation();
  const URLS = task?.assets ? [...task.assets] : [];

  const resetForm = () => {
  reset(defaultValues); 
  
  setTeam([]);
  setStage(LISTS[0]);
  setPriority(PRIORIRY[2]);
  setAssets([]);
  
  uploadedFileURLs.length = 0; 
  };

  const handleCancel = () => {
    resetForm();
    setOpen(false);
  }


  useEffect(() => {
    if (task) {
      reset({
        ...defaultValues,
        title: task.title,
        date: dateFormatter(task.date),
      });
      setTeam(task.team || []);
      setStage(task.stage?.toUpperCase() || LISTS[0]); 
      setPriority(task.priority?.toUpperCase() || PRIORIRY[2]);
    } else {
        resetForm();
    }
  }, [open, task, reset]);

  const handleOnSubmit = async (data) => {

     if (team.length === 0) {
      toast.error("É obrigatório selecionar pelo menos um responsável pela tarefa.");
      return;
    }

    const [year, month, day] = data.date.split('-');
    const selectedDate = new Date(year, month - 1, day); 

    for (const file of assets) {
      setUploading(true);
      try {
        await uploadFile(file);
      } catch (error) {
        console.error("Error uploading file:", error.message);
        return;
      } finally {
        setUploading(false);
      }
    }

    try {
      const newData = {
        ...data,
        date: selectedDate,
        assets: [...URLS, ...uploadedFileURLs],
        team,
        stage,
        priority,
      };
      console.log(data, newData);
      const res = task?._id
        ? await updateTask({ ...newData, _id: task._id }).unwrap()
        : await createTask(newData).unwrap();

      toast.success(res.message);

      setTimeout(() => {
        setOpen(false);
      }, 500);
    } catch (err) {
      console.log(err);
      toast.error(err?.data?.message || err.error);
    }
  };

  const handleSelect = (e) => {
    setAssets(e.target.files);
  };

  return (
    <>
      <ModalWrapper open={open} setOpen={setOpen}>
        <form onSubmit={handleSubmit(handleOnSubmit)}>
          <Dialog.Title
            as='h2'
            className='text-base font-bold leading-6 text-gray-900 mb-4'
          >
            {task ? "EDITAR TAREFA" : "ADICIONAR TAREFA"}
          </Dialog.Title>

          <div className='mt-2 flex flex-col gap-6'>
            <Textbox
              placeholder='Título da Tarefa'
              type='text'
              name='title'
              label='Título da Tarefa'
              className='w-full rounded'
              register={register("title", {
                required: "O título é obrigatório!",
                  minLength: {
                    value: 3,
                    message: "O título deve ter pelo menos 3 caracteres",
                  },
                  maxLength: {
                    value: 100,
                    message: "O título não pode exceder 100 caracteres",
                  },
              })}
              error={errors.title ? errors.title.message : ""}
            />
            <UserList setTeam={setTeam} team={team} />
            <div className='flex gap-4'>
              <SelectList
                label='Status da Tarefa'
                lists={LISTS}
                selected={stage}
                setSelected={setStage}
                getLabel={(val) => STATUS_PT_BR[val] || val}
              />
              <SelectList
                label='Prioridade'
                lists={PRIORIRY}
                selected={priority}
                setSelected={setPriority}
                getLabel={(val) => PRIORITY_PT_BR[val] || val}
              />
            </div>
            <div className='flex gap-4'>
              <div className='w-full'>
                <Textbox
                  placeholder='Data'
                  type='date'
                  name='date'
                  label='Data da Tarefa'
                  className='w-full rounded'
                  register={register("date", {
                    required: "A data é obrigatória!",
                  })}
                  error={errors.date ? errors.date.message : ""}
                />
              </div>
              <div className='w-full flex items-center justify-center mt-4'>
                <label
                  className='flex items-center gap-1 text-base text-ascent-2 hover:text-ascent-1 cursor-pointer my-4'
                  htmlFor='imgUpload'
                >
                  <input
                    type='file'
                    className='hidden'
                    id='imgUpload'
                    onChange={(e) => handleSelect(e)}
                    accept='.jpg, .png, .jpeg'
                    multiple={true}
                  />
                  <BiImages />
                  <span>Adicionar Arquivos</span>
                </label>
              </div>
            </div>

            <div className='w-full'>
              <p>Descrição da Tarefa</p>
              <textarea
                name='description'
                {...register("description")}
                className='w-full bg-transparent px-3 py-1.5 2xl:py-3 border border-gray-300
            dark:border-gray-600 placeholder-gray-300 dark:placeholder-gray-700
            text-gray-900 dark:text-white outline-none text-base focus:ring-2
            ring-blue-300'
              ></textarea>
            </div>

            <div className='w-full'>
              <p>
                Adicionar links{" "}
                <span className='text- text-gray-600'>
                  separados por vírgula (,)
                </span>
              </p>
              <textarea
                name='links'
                {...register("links")}
                className='w-full bg-transparent px-3 py-1.5 2xl:py-3 border border-gray-300
            dark:border-gray-600 placeholder-gray-300 dark:placeholder-gray-700
            text-gray-900 dark:text-white outline-none text-base focus:ring-2
            ring-blue-300'
              ></textarea>
            </div>
          </div>

          {isLoading || isUpdating || uploading ? (
            <div className='py-4'>
              <Loading />
            </div>
          ) : (
            <div className='mt-6 mb-4 sm:flex sm:flex-row-reverse gap-4'>
              <Button
                label='Enviar'
                type='submit'
                className='bg-blue-400 px-8 text-sm font-semibold text-white hover:bg-blue-300  sm:w-auto'
              />

              <Button
                  type='button'
                  className='bg-red-400 hover:bg-red-200 px-5 text-sm font-semibold text-white sm:w-auto'
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

export default AddTask;