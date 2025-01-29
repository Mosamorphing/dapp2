import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import abi from "./abi.json";

const CONTRACT_ADDRESS = "0xCaA3A0Fe5E67A97FE170cEd4850a0C009b899646";

const TaskDApp = () => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskText, setTaskText] = useState("");

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);

        setProvider(provider);
        setSigner(signer);
        setContract(contract);
        fetchTasks(contract);
      }
    };
    init();
  }, []);

  const fetchTasks = async (contract) => {
    try {
      const tasks = await contract.getMyTask();
      console.log("Fetched tasks:", tasks); // Debugging
      setTasks(tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };


  const addTask = async () => {
    if (!contract) {
      console.error("Contract not initialized");
      return;
    }
    try {
      console.log("Adding task:", taskTitle, taskText);
      const tx = await contract.addTask(taskTitle, taskText, false);
      await tx.wait();
      console.log("Task added!");
      setTaskTitle(""); // Clear input
      setTaskText(""); 
      fetchTasks(contract); // Fetch updated tasks
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };  

  const deleteTask = async (taskId) => {
    if (!contract) return;
    try {
      const tx = await contract.deleteTask(taskId);
      await tx.wait();
      fetchTasks(contract);
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      backgroundColor: "#f4f4f4"
    }}>
      <div style={{
        width: "50%",
        padding: "20px",
        backgroundColor: "#fff",
        borderRadius: "10px",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
        textAlign: "center"
      }}>
        <h2>Task Manager</h2>
        <input 
          type="text" 
          placeholder="Task Title" 
          value={taskTitle} 
          onChange={(e) => setTaskTitle(e.target.value)}
          style={{ width: "80%", padding: "10px", marginBottom: "10px" }}
        />
        <input 
          type="text" 
          placeholder="Task Description" 
          value={taskText} 
          onChange={(e) => setTaskText(e.target.value)}
          style={{ width: "80%", padding: "10px", marginBottom: "10px" }}
        />
        <button onClick={addTask} style={{ padding: "10px 20px", marginBottom: "20px" }}>Add Task</button>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {tasks.map((task, index) => (
            <li key={index} style={{ marginBottom: "10px", padding: "10px", backgroundColor: "#e9ecef", borderRadius: "5px" }}>
              {task.taskTitle} - {task.taskText}
              <button onClick={() => deleteTask(task.id)} style={{ marginLeft: "10px" }}>Delete</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TaskDApp;
