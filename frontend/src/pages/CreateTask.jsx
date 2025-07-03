import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function CreateTask() {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    axios
      .post(
        'http://localhost:5000/tasks',
        { title, category, completed: false },
        { withCredentials: true }            // 🔑 send session cookie
      )
      .then(() => {
        // success → clear local flag & refresh protected routes
        window.dispatchEvent(new Event('storage'));
        navigate('/');
      })
      .catch((err) => {
        if (err.response?.status === 401) {
          alert('Please log in first');
          navigate('/login');
        } else {
          console.error(err);
          alert('Failed to add task');
        }
      });
  };

  return (
    <div className="container">
      <h2>➕ Create Task</h2>
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <input
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
        <button type="submit">Add Task</button>{' '}
        <Link to="/">Cancel</Link>
      </form>
    </div>
  );
}

export default CreateTask;
