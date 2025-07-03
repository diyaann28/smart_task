// src/pages/EditTask.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';

function EditTask() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);

  // ✅ Fetch the task on mount
  useEffect(() => {
    axios
      .get('http://localhost:5000/tasks', { withCredentials: true })
      .then((res) => {
        const found = res.data.find((t) => t.id === parseInt(id));
        if (!found) {
          alert('Task not found');
          navigate('/');
        } else {
          setTask(found);
        }
      })
      .catch((err) => {
        if (err.response?.status === 401) {
          alert('Please login first');
          navigate('/login');
        } else {
          console.error(err);
          alert('Error fetching task');
        }
      });
  }, [id, navigate]);

  const handleUpdate = (e) => {
    e.preventDefault();
    axios
      .put(
        `http://localhost:5000/tasks/${id}`,
        task,
        { withCredentials: true } // ✅ send cookie
      )
      .then(() => {
        navigate('/');
      })
      .catch((err) => {
        console.error(err);
        alert('Update failed');
      });
  };

  if (!task) return <div>Loading...</div>;

  return (
    <div className="container">
      <h2>✏️ Edit Task</h2>
      <form onSubmit={handleUpdate}>
        <input
          value={task.title}
          onChange={(e) => setTask({ ...task, title: e.target.value })}
          required
        />
        <input
          value={task.category}
          onChange={(e) => setTask({ ...task, category: e.target.value })}
        />
        <label>
          <input
            type="checkbox"
            checked={task.completed}
            onChange={(e) =>
              setTask({ ...task, completed: e.target.checked })
            }
          />{' '}
          Completed
        </label>
        <button type="submit">Update</button>{' '}
        <Link to="/">Cancel</Link>
      </form>
    </div>
  );
}

export default EditTask;
