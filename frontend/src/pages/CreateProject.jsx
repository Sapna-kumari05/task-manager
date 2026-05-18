import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { projectsAPI } from "../lib/api";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Label from "../components/ui/Label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/Card";
import { ArrowLeft, FolderPlus } from "lucide-react";

const CreateProject = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await projectsAPI.create(formData);
      navigate(`/projects/${response.data.id}`);
    } catch (err) {
      console.error("Error creating project:", err);
      alert(err.response?.data?.error || "Error creating project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMSIgZmlsbD0iIzAwZjBmZiIgb3BhY2l0eT0iMC4xIi8+PC9zdmc+')] opacity-20"></div>
      <div className="relative z-10">
      <header className="border-b border-neon-blue/30 bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FolderPlus className="h-6 w-6 mr-2" />
                Create New Project
              </CardTitle>
              <CardDescription>
                Create a new project to start collaborating with your team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Project Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="My Awesome Project"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="A brief description of your project"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Creating..." : "Create Project"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      </div>
    </div>
  );
};

export default CreateProject;
