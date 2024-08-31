"use client";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import Image from "next/image";
import { useRouter } from "next/navigation.js";
import { useEffect, useState } from "react";
import trashIcon from "./assets/delete_24dp_E8EAED_FILL0_wght400_GRAD0_opsz24.svg";
import { auth, firestore } from "./db/firebase";
interface TodoData {
  todo: string;
  done: boolean;
  userID: string;
  timestamp: Timestamp;
  id: string;
}
export default function Home() {
  const router = useRouter();
  const todosRef = collection(firestore, "todos");
  const [data, setData] = useState<Omit<TodoData, "id">>({
    todo: "",
    done: false,
    userID: "",
    timestamp: Timestamp.now(),
  });
  const [todos, setTodos] = useState<TodoData[]>([]);
  const [userData, setUserData] = useState({
    name: "",
    profilePic: "",
    uid: "",
    email: "",
  });

  const addTodo = async () => {
    if (data.todo !== "") {
      const docRef = await addDoc(todosRef, {
        ...data,
        timestamp: Timestamp.now(),
      });
    }
  };

  const toggleDone = async (todoId: string, currentDone: boolean) => {
    if (!todoId) {
      console.error("Invalid todoId provided:", todoId);
      return;
    }
    const todoDoc = doc(firestore, "todos", todoId);
    await updateDoc(todoDoc, {
      done: !currentDone,
    });
  };

  const deleteTodo = async (todoId: string) => {
    if (!todoId) {
      console.error("Invalid todoId provided for deletion:", todoId);
      return;
    }
    const todoDoc = doc(firestore, "todos", todoId);
    await deleteDoc(todoDoc);
    console.log("Document deleted with ID:", todoId);
  };

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setData((prevData) => ({
          ...prevData,
          userID: user.uid ?? "none",
        }));
        console.log(user);
        setUserData({
          name: user.displayName ?? "Guest",
          profilePic: user.photoURL ?? "there is not any",
          uid: user.uid,
          email: user.email ?? "",
        });
      } else {
        router.push("/account");
      }
      console.log(userData.profilePic);
    });

    const unsubscribeSnapshot = onSnapshot(todosRef, (querySnapshot) => {
      const todosArray: TodoData[] = [];
      querySnapshot.forEach((doc) => {
        const todoData = { id: doc.id, ...doc.data() } as TodoData;
        console.log("Todo data retrieved:", todoData);
        if (todoData && todoData.timestamp) {
          todosArray.push(todoData);
        }
      });
      todosArray.sort((a, b) => {
        const aTimestamp = a.timestamp?.seconds || 0;
        const bTimestamp = b.timestamp?.seconds || 0;
        return bTimestamp - aTimestamp;
      });
      setTodos(todosArray);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeSnapshot();
    };
  }, [router]);

  const signOutFunction = () => {
    signOut(auth)
      .then(() => {
        router.push("/account");
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <main className="flex flex-col items-center gap-12 w-full h-screen">
      <div className="mt-12">
        <h1 className="text-6xl text-teal-300 bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 bg-clip-text text-transparent">
          Liquidus
        </h1>
      </div>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          addTodo();
          setData({ ...data, todo: "" });
        }}
        className=" p-2 flex flex-col  gap-12 w-full"
      >
        <div className="flex justify-center items-center gap-8">
          <textarea
            value={data.todo}
            onChange={(e) => {
              setData((prevData) => ({
                ...prevData,
                todo: e.target.value,
              }));
            }}
            className="border-2 bg-neutral-800 rounded-md w-4/6 !h-24 border-neutral-500
            focus:bg-neutral-700 outline-none focus:border-neutral-300 transition-colors
            duration-100 p-2"
          />
          <button
            type="submit"
            className="bg-teal-400 text-black p-2 rounded-lg hover:bg-teal-500 font-bold h-min transition-colors duration-150"
          >
            Add
          </button>
        </div>

        <div className="self-center relative flex flex-col gap-3 w-1/2">
          {todos
            .filter((todo) => todo.userID === userData.uid)
            .map((todo) => (
              <div
                key={todo.id}
                className={`p-1 ${todo.done ? "bg-green-500" : "bg-red-500"} hover:-translate-y-1 rounded-md w-full flex justify-between gap-8 transition-transform duration-200 cursor-pointer`}
                onClick={() => toggleDone(todo.id, todo.done)}
              >
                <p className="m-2">{todo.todo}</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteTodo(todo.id);
                  }}
                >
                  <Image
                    className="scale-125 p-0.5 bg-red-700 rounded-md mr-2 hover:bg-red-800 transition-colors duration-150"
                    src={trashIcon}
                    alt=""
                  />
                </button>
              </div>
            ))}
        </div>
      </form>
      <div className="fixed bottom-0 bg-neutral-800 w-full flex justify-center">
        <div className="flex bg-neutral-800 p-4 rounded-md gap-4 justify-self-end">
          <div>
            <img
              src={userData.profilePic}
              alt="asdasd"
              className="rounded-full"
            />
          </div>
          <div className="relative flex flex-col justify-between">
            <div>
              <h1 className="text-xl">{userData.name}</h1>
              <h1>{userData.email}</h1>
            </div>
            <button
              onClick={signOutFunction}
              className="bg-red-600 hover:bg-red-700 transition-colors duration-150 p-1 rounded-md"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
