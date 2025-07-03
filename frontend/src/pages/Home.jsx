// import { useEffect, useState } from 'react';
// import axios from 'axios';
// import { Link } from 'react-router-dom';
// import '../App.css'; // ✅ make sure this import is at the top

// function Home() {
//   const [tasks, setTasks] = useState([]);

//   useEffect(() => {
//     axios.get('http://localhost:5000/tasks')
//       .then(res => setTasks(res.data))
//       .catch(err => console.error(err));
//   }, []);

//   const deleteTask = (id) => {
//     axios.delete(`http://localhost:5000/tasks/${id}`)
//       .then(() => setTasks(tasks.filter(task => task.id !== id)))
//       .catch(err => console.error(err));
//   };

//   const toggleComplete = (task) => {
//     axios.put(`http://localhost:5000/tasks/${task.id}`, {
//       ...task,
//       completed: !task.completed
//     }).then(() => {
//       setTasks(tasks.map(t => t.id === task.id ? { ...t, completed: !t.completed } : t));
//     });
//   };

//   const totalTasks = tasks.length;
//   const completedTasks = tasks.filter(task => task.completed).length;
//   const percentComplete = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

//   return (
//     <div className="container">
//       <h1>📋 Task List</h1>

//       <div className="summary">
//         ✅ Completed: {completedTasks} / {totalTasks} tasks ({percentComplete}%)
//       </div>

//       <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
//         <Link to="/create" style={{ fontWeight: 'bold' }}>➕ Add Task</Link>
//       </div>

//       <ul>
//         {tasks.map(task => (
//           <li key={task.id}>
//             <input
//               type="checkbox"
//               checked={task.completed}
//               onChange={() => toggleComplete(task)}
//             />
//             <span style={{ textDecoration: task.completed ? 'line-through' : 'none' }}>
//               {task.title} [{task.category}]
//             </span>
//             <div>
//               <button onClick={() => deleteTask(task.id)}>❌</button>
//               <Link to={`/edit/${task.id}`}>✏️</Link>
//             </div>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// }

// export default Home;
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import '../App.css';

function Home() {
  const [tasks, setTasks] = useState([]);
  const navigate = useNavigate();

  /* ── fetch tasks once ─────────────────── */
 useEffect(() => {
    axios
      .get("http://localhost:5000/tasks", { withCredentials: true })
      .then((res) => setTasks(res.data))
      .catch((err) => {
        // if session cookie is missing/expired, backend returns 401
        if (err.response?.status === 401) {
          navigate('/login');       // redirect user to Login page
        } else {
          console.error(err);       // other errors -> log
        }
      });
  }, [navigate]);

  /* ── helpers ──────────────────────────── */
  const deleteTask = (id) =>
    axios
      .delete(`http://localhost:5000/tasks/${id}`, { withCredentials: true })
      .then(() => setTasks((prev) => prev.filter((t) => t.id !== id)));

  const toggleComplete = (task) =>
    axios
      .put(
        `http://localhost:5000/tasks/${task.id}`,
        { ...task, completed: !task.completed },
        { withCredentials: true }
      )
      .then(() =>
        setTasks((prev) =>
          prev.map((t) =>
            t.id === task.id ? { ...t, completed: !t.completed } : t
          )
        )
      );

  /* ── drag‑n‑drop reorder ──────────────── */
  const onDragEnd = ({ source, destination }) => {
    if (!destination) return;
    const reordered = Array.from(tasks);
    const [moved] = reordered.splice(source.index, 1);
    reordered.splice(destination.index, 0, moved);
    setTasks(reordered);
  };

  /* ── summary ──────────────────────────── */
  const total = tasks.length;
  const done = tasks.filter((t) => t.completed).length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  /* ── logout handler ───────────────────── */
  const handleLogout = async () => {
    try {
      await axios.post(
        'http://localhost:5000/logout',
        {},
        { withCredentials: true }
      );
    } catch (err) {
      /* ignore network error, continue client logout */
    }
    localStorage.removeItem('logged');
    navigate('/login');
  };

  /* ── priority color helper ────────────── */
  const colorBadge = (prio) =>
    ({
      High: '#ff6b6b',
      Medium: '#ffa94d',
      Low: '#51cf66'
    }[prio] || '#ced4da');

  return (
    <div className="container">
      {/* header row */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <h1>📋 Task List</h1>
        <button
          onClick={handleLogout}
          style={{
            background: '#ff5252',
            color: '#fff',
            border: 'none',
            padding: '8px 14px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          🚪 Logout
        </button>
      </div>

      {/* summary */}
      <div className="summary">
        ✅ Completed: {done} / {total} tasks ({pct}%)
      </div>

      {/* add‑task link */}
      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <Link to="/create" style={{ fontWeight: 'bold' }}>
          ➕ Add Task
        </Link>
      </div>

      {/* drag‑n‑drop list */}
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="tasks">
          {(provided) => (
            <ul {...provided.droppableProps} ref={provided.innerRef}>
              {tasks.map((task, index) => (
                <Draggable
                  key={task.id}
                  draggableId={task.id.toString()}
                  index={index}
                >
                  {(provided) => (
                    <li
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleComplete(task)}
                      />
                      <span
                        style={{
                          textDecoration: task.completed
                            ? 'line-through'
                            : 'none'
                        }}
                      >
                        {task.title} [{task.category}]
                      </span>
                      {/* priority badge */}
                      <span
                        style={{
                          marginLeft: 6,
                          padding: '2px 6px',
                          borderRadius: 4,
                          background: colorBadge(task.priority),
                          color: '#fff',
                          fontSize: 12
                        }}
                      >
                        {task.priority}
                      </span>
                      <div>
                        <button onClick={() => deleteTask(task.id)}>❌</button>
                        <Link to={`/edit/${task.id}`}>✏️</Link>
                      </div>
                    </li>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </ul>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}

export default Home;

