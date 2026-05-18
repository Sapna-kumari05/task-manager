import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { projectsAPI, tasksAPI, usersAPI } from "../lib/api";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Label from "../components/ui/Label";
import Select from "../components/ui/Select";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Modal from "../components/ui/Modal";
import { ArrowLeft, Plus, Users, Trash2, Edit } from "lucide-react";

const ProjectDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    assigned_to: "",
    priority: "medium",
    due_date: "",
  });
  const [memberForm, setMemberForm] = useState({ email: "", role: "member" });
  const [editForm, setEditForm] = useState({ name: "", description: "" });
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetchProject();
    fetchTasks();
    fetchUsers();
  }, [id]);

  const fetchProject = async () => {
    try {
      const response = await projectsAPI.getById(id);
      setProject(response.data);
      setEditForm({ name: response.data.name, description: response.data.description });
    } catch (err) {
      console.error("Error fetching project:", err);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await tasksAPI.getByProject(id);
      setTasks(response.data);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await usersAPI.getAll();
      setUsers(response.data);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await tasksAPI.create({ ...taskForm, project_id: id });
      setShowTaskModal(false);
      setTaskForm({ title: "", description: "", assigned_to: "", priority: "medium", due_date: "" });
      fetchTasks();
    } catch (err) {
      console.error("Error creating task:", err);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      await projectsAPI.addMember(id, memberForm);
      setShowMemberModal(false);
      setMemberForm({ email: "", role: "member" });
      fetchProject();
    } catch (err) {
      console.error("Error adding member:", err);
      alert(err.response?.data?.error || "Error adding member");
    }
  };

  const handleUpdateProject = async (e) => {
    e.preventDefault();
    try {
      await projectsAPI.update(id, editForm);
      setShowEditModal(false);
      fetchProject();
    } catch (err) {
      console.error("Error updating project:", err);
    }
  };

  const handleDeleteProject = async () => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        await projectsAPI.delete(id);
        navigate("/dashboard");
      } catch (err) {
        console.error("Error deleting project:", err);
      }
    }
  };

  const handleRemoveMember = async (userId) => {
    if (window.confirm("Are you sure you want to remove this member?")) {
      try {
        await projectsAPI.removeMember(id, userId);
        fetchProject();
      } catch (err) {
        console.error("Error removing member:", err);
      }
    }
  };

  const handleUpdateTaskStatus = async (taskId, status) => {
    try {
      await tasksAPI.update(taskId, { status });
      fetchTasks();
    } catch (err) {
      console.error("Error updating task:", err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await tasksAPI.delete(taskId);
        fetchTasks();
      } catch (err) {
        console.error("Error deleting task:", err);
      }
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: "secondary",
      in_progress: "info",
      completed: "success",
      overdue: "destructive",
    };
    return <Badge variant={variants[status] || "default"}>{status.replace("_", " ")}</Badge>;
  };

  const getPriorityBadge = (priority) => {
    const variants = {
      low: "secondary",
      medium: "default",
      high: "destructive",
    };
    return <Badge variant={variants[priority] || "default"}>{priority}</Badge>;
  };

  const isAdmin = project?.user_role === "admin" || user?.role === "admin";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMSIgZmlsbD0iI2IwMjZmZiIgb3BhY2l0eT0iMC4xIi8+PC9zdmc+')] opacity-20"></div>
      <div className="relative z-10">
      <header className="border-b border-neon-blue/30 bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-xl font-bold">{project?.name}</h1>
            <Badge variant={project?.user_role === "admin" ? "default" : "secondary"}>
              {project?.user_role}
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            {isAdmin && (
              <>
                <Button variant="outline" onClick={() => setShowEditModal(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button variant="destructive" onClick={handleDeleteProject}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Tasks</h2>
              <Button onClick={() => setShowTaskModal(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Task
              </Button>
            </div>

            {tasks.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground mb-4">No tasks yet</p>
                  <Button onClick={() => setShowTaskModal(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Task
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {tasks.map((task) => (
                  <Card key={task.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-2">{task.title}</h3>
                          <p className="text-muted-foreground text-sm mb-3">{task.description}</p>
                          <div className="flex items-center space-x-3">
                            {getStatusBadge(task.status)}
                            {getPriorityBadge(task.priority)}
                            {task.due_date && (
                              <span className="text-sm text-muted-foreground">
                                Due: {new Date(task.due_date).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          {task.assigned_to_name && (
                            <p className="text-sm text-muted-foreground mt-2">
                              Assigned to: {task.assigned_to_name}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <Select
                            value={task.status}
                            onChange={(e) => handleUpdateTaskStatus(task.id, e.target.value)}
                            className="w-32"
                          >
                            <option value="pending">Pending</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                          </Select>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteTask(task.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Team Members
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {project?.members?.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                    >
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={member.role === "admin" ? "default" : "secondary"}>
                          {member.role}
                        </Badge>
                        {isAdmin && member.id !== user.id && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveMember(member.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {isAdmin && (
                  <Button className="w-full mt-4" onClick={() => setShowMemberModal(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Member
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Project Info</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">
                  Created: {new Date(project?.created_at).toLocaleDateString()}
                </p>
                <p className="text-sm">{project?.description || "No description"}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Modal isOpen={showTaskModal} onClose={() => setShowTaskModal(false)} title="Create Task">
        <form onSubmit={handleCreateTask} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={taskForm.title}
              onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={taskForm.description}
              onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="assigned_to">Assign To</Label>
            <Select
              id="assigned_to"
              value={taskForm.assigned_to}
              onChange={(e) => setTaskForm({ ...taskForm, assigned_to: e.target.value })}
            >
              <option value="">Unassigned</option>
              {project?.members?.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select
              id="priority"
              value={taskForm.priority}
              onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="due_date">Due Date</Label>
            <Input
              id="due_date"
              type="date"
              value={taskForm.due_date}
              onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })}
            />
          </div>
          <Button type="submit" className="w-full">
            Create Task
          </Button>
        </form>
      </Modal>

      <Modal isOpen={showMemberModal} onClose={() => setShowMemberModal(false)} title="Add Member">
        <form onSubmit={handleAddMember} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={memberForm.email}
              onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select
              id="role"
              value={memberForm.role}
              onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value })}
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </Select>
          </div>
          <Button type="submit" className="w-full">
            Add Member
          </Button>
        </form>
      </Modal>

      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Project">
        <form onSubmit={handleUpdateProject} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Project Name</Label>
            <Input
              id="name"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
            />
          </div>
          <Button type="submit" className="w-full">
            Update Project
          </Button>
        </form>
      </Modal>
      </div>
    </div>
  );
};

export default ProjectDetail;
