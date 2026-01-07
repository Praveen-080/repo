import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import AdminLoginForm from "@/components/AdminLoginForm";

export default function AdminLoginModal() {
  const { showAdminLogin, setShowAdminLogin } = useAdminAuth();

  return (
    <Dialog open={showAdminLogin} onOpenChange={setShowAdminLogin}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Admin Sign In</DialogTitle>
        </DialogHeader>
        <AdminLoginForm onSuccess={() => setShowAdminLogin(false)} />
      </DialogContent>
    </Dialog>
  );
}
