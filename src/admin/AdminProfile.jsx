import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import notify from "@/lib/notify";
import { useNavigate } from "react-router-dom";
import { LogOut, User, Shield, LayoutDashboard } from "lucide-react";

export default function AdminProfile() {
  const { adminUser, logout, setShowAdminLogin } = useAdminAuth();
  const navigate = useNavigate();

  if (!adminUser) {
    return (
      <div className="container py-12 flex-1 flex flex-col items-center justify-center text-center">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Admin Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">You need to sign in as admin to view this profile.</p>
            <Button onClick={() => setShowAdminLogin(true)}>Sign In as Admin</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      await logout();
      notify.success("Signed out successfully");
      navigate("/");
    } catch {
      notify.error("Failed to sign out");
    }
  };

  return (
    <div className="container py-10 flex-1">
      <h1 className="text-3xl font-bold mb-6">Admin Profile</h1>
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" /> Account Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {adminUser.uid && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Admin ID</span>
                  <span className="font-mono text-sm">{adminUser.uid}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name</span>
                <span className="font-semibold">{adminUser.name || "Admin"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Role</span>
                <span className="uppercase text-xs font-semibold px-3 py-1.5 rounded bg-primary text-primary-foreground flex items-center gap-1 w-fit">
                  <Shield className="h-3 w-3" />
                  {adminUser.role}
                </span>
              </div>
              {adminUser.phn_number && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phone Number</span>
                  <span className="font-mono">{adminUser.phn_number}</span>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex gap-3">
              <Button variant="outline" onClick={() => navigate("/admin/dashboard")}>
                <LayoutDashboard className="mr-2 h-4 w-4" /> Admin Dashboard
              </Button>
              <Button variant="destructive" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" /> Sign Out
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Admin Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" variant="secondary" onClick={() => navigate("/admin/dashboard")}>
                Dashboard
              </Button>
              <Button className="w-full" variant="secondary" onClick={() => navigate("/admin/products")}>
                Manage Products
              </Button>
              <Button className="w-full" variant="secondary" onClick={() => navigate("/admin/orders")}>
                View Orders
              </Button>
              <Button className="w-full" variant="secondary" onClick={() => navigate("/admin/inventory")}>
                Inventory
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
  );
}
