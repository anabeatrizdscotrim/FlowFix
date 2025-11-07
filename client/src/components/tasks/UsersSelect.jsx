import { Listbox, Transition } from "@headlessui/react";
import { Fragment, useEffect, useState } from "react";
import { BsChevronExpand } from "react-icons/bs";
import { MdCheck, MdClose } from "react-icons/md";
import { useGetTeamListsQuery } from "../../redux/slices/api/userApiSlice.js";
import { getInitials } from "../../utils/index.js";

export default function UserList({ team, setTeam }) {
  const { data, isLoading } = useGetTeamListsQuery({ search: "" });
  const [selectedUsers, setSelectedUsers] = useState([]);

  const removeUser = (userId) => {
    const updatedUsers = selectedUsers.filter((user) => user._id !== userId);
    setSelectedUsers(updatedUsers);
    setTeam(updatedUsers.map((el) => el._id));
  };

  const handleChange = (el) => {
    setSelectedUsers(el);
    setTeam(el.map((el) => el._id));
  };

  useEffect(() => {
    if (data && team?.length > 0) {
      const initialUsers = team
        .map((item) => {
          const userId = typeof item === "object" ? item._id : item;
          return data.find((user) => user._id === userId);
        })
        .filter(Boolean);

      setSelectedUsers(initialUsers);
    } else if (data && team?.length === 0) {
      setSelectedUsers([]);
    }
  }, [data, team]);

  if (isLoading) return <p className="text-gray-500">Carregando usuários...</p>;

  return (
    <div>
      <p className="text-slate-900 dark:text-gray-500">Atribuir tarefa para:</p>
      <Listbox value={selectedUsers} onChange={handleChange} multiple>
        <div className="relative mt-1">
          <Listbox.Button className="relative w-full cursor-default rounded bg-white pl-3 pr-10 text-left px-3 py-2.5 2xl:py-3 border border-gray-300 dark:border-gray-600 sm:text-sm">
            <div className="flex flex-wrap gap-1 min-h-[28px] pr-8">
              {selectedUsers.length > 0 ? (
                selectedUsers.map((user) => (
                  <span
                    key={user._id}
                    className="flex items-center bg-blue-100 text-blue-800 rounded-full px-2 py-1 text-xs font-medium"
                  >
                    {user.name}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeUser(user._id);
                      }}
                      className="ml-1 text-blue-600 hover:text-red-500 rounded-full"
                    >
                      <MdClose className="h-4 w-4" />
                    </button>
                  </span>
                ))
              ) : (
                <span className="text-gray-400 dark:text-gray-500">
                  Selecione um ou mais responsáveis...
                </span>
              )}
            </div>

            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <BsChevronExpand className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </span>
          </Listbox.Button>

          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="z-50 absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
              {data?.map((user) => (
                <Listbox.Option
                  key={user._id}
                  disabled={!user.isActive}
                  className={({ active, disabled }) =>
                    `relative cursor-default select-none py-2 pl-10 pr-4 ${
                      disabled
                        ? "text-gray-400 cursor-not-allowed"
                        : active
                        ? "bg-gray-100 text-black"
                        : "text-gray-900"
                    }`
                  }
                  value={user}
                >
                  {({ selected, disabled }) => (
                    <>
                      <div
                        className={`flex items-center gap-2 truncate ${
                          selected ? "font-medium" : "font-normal"
                        }`}
                      >
                        <div className="w-6 h-6 rounded-full text-white flex items-center justify-center bg-black">
                          <span className="text-center text-[10px]">
                            {getInitials(user.name)}
                          </span>
                        </div>
                        <span>
                          {user.name} {!user.isActive && "(Inativo)"}
                        </span>
                      </div>
                      {selected && !disabled && (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-green-400">
                          <MdCheck className="h-5 w-5" aria-hidden="true" />
                        </span>
                      )}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
}
