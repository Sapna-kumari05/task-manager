import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { projectsAPI, tasksAPI } from "../lib/api";
import Button from "../components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import { LayoutDashboard, Plus, FolderOpen, CheckCircle2, Clock, AlertCircle } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, completed: 0, overdue: 0 });
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await projectsAPI.getAll();
      setProjects(response.data);
      
      // Fetch stats for all projects
      let totalStats = { total: 0, pending: 0, inProgress: 0, completed: 0, overdue: 0 };
      for (const project of response.data) {
        try {
          const statsResponse = await tasksAPI.getStats(project.id);
          totalStats.total += statsResponse.data.total;
          totalStats.pending += statsResponse.data.pending;
          totalStats.inProgress += statsResponse.data.in_progress;
          totalStats.completed += statsResponse.data.completed;
          totalStats.overdue += statsResponse.data.overdue;
        } catch (err) {
          console.error("Error fetching stats for project:", project.id);
        }
      }
      setStats(totalStats);
    } catch (err) {
      console.error("Error fetching projects:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMSIgZmlsbD0iIzAwZjBmZiIgb3BhY2l0eT0iMC4xIi8+PC9zdmc+')] opacity-20"></div>
      <div className="relative z-10">
      <header className="border-b border-neon-blue/30 bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <LayoutDashboard className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Team Task Manager</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">
              Welcome, {user?.name}
            </span>
            <Badge variant={user?.role === "admin" ? "default" : "secondary"}>
              {user?.role}
            </Badge>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold">Dashboard</h2>
            <p className="text-muted-foreground mt-1">Overview of your projects and tasks</p>
          </div>
          <Button onClick={() => navigate("/projects/new")}>
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.inProgress}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completed}</div>
            </CardContent>
          </Card>
        </div>

        {stats.overdue > 0 && (
          <Card className="mb-8 border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center">
                <AlertCircle className="mr-2 h-5 w-5" />
                Overdue Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold">{stats.overdue} tasks are overdue</p>
            </CardContent>
          </Card>
        )}

        <div>
          <h3 className="text-xl font-semibold mb-4">Your Projects</h3>
          {projects.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">No projects yet</p>
                <Button onClick={() => navigate("/projects/new")}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Project
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Card
                  key={project.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => navigate(`/projects/${project.id}`)}
                >
                  <CardHeader>
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    <CardDescription>{project.description || "No description"}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <Badge variant={project.user_role === "admin" ? "default" : "secondary"}>
                        {project.user_role}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(project.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      </div>
    </div>
  );
};

export default Dashboard;
