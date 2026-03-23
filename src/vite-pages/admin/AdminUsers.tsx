import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Shield, ShieldOff, Edit, Loader2, Mail, Trash2, Plus, Eye, EyeOff, Home, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { 
  useAllProfiles, 
  useAddUserRole, 
  useRemoveUserRole, 
  useAdminUpdateUser,
  useDeleteUser,
  useCreateUser,
  UserWithRole 
} from '@/hooks/useProfiles';
import { useAuth, AppRole } from '@/hooks/useAuth';
import { PasswordStrengthIndicator, getPasswordStrength } from '@/components/admin/PasswordStrengthIndicator';

const ROLE_CONFIG_KEYS: { role: AppRole; labelKey: string; descKey: string; icon: typeof Shield }[] = [
  { role: 'admin', labelKey: 'admin.roles.admin', descKey: 'admin.roles.fullAccess', icon: Shield },
  { role: 'listing_editor', labelKey: 'admin.roles.listingEditor', descKey: 'admin.roles.canManageListings', icon: Home },
  { role: 'agent', labelKey: 'admin.roles.agent', descKey: 'admin.roles.canViewListingsLeads', icon: Users },
];

export default function AdminUsers() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const { data: users, isLoading } = useAllProfiles();
  const addRole = useAddUserRole();
  const removeRole = useRemoveUserRole();
  const adminUpdate = useAdminUpdateUser();
  const deleteUser = useDeleteUser();
  const createUser = useCreateUser();

  const [searchTerm, setSearchTerm] = useState('');
  const [roleAction, setRoleAction] = useState<{
    user: UserWithRole;
    action: 'add' | 'remove';
    role: 'admin' | 'listing_editor' | 'agent' | 'user';
  } | null>(null);
  
  // Edit dialog state
  const [editUser, setEditUser] = useState<UserWithRole | null>(null);
  const [editForm, setEditForm] = useState({ fullName: '', email: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);
  
  // Delete dialog state
  const [deleteTarget, setDeleteTarget] = useState<UserWithRole | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Create user dialog state
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createForm, setCreateForm] = useState({ fullName: '', email: '', password: '', role: 'user' as 'admin' | 'listing_editor' | 'agent' | 'user' });
  const [isCreating, setIsCreating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const passwordStrength = getPasswordStrength(createForm.password);

  const filteredUsers = users?.filter((user) => {
    const search = searchTerm.toLowerCase();
    return (
      user.fullName?.toLowerCase().includes(search) ||
      user.email?.toLowerCase().includes(search)
    );
  });

  const handleRoleAction = async () => {
    if (!roleAction) return;

    try {
      const targetName = roleAction.user.fullName || roleAction.user.email || undefined;
      if (roleAction.action === 'add') {
        await addRole.mutateAsync({
          userId: roleAction.user.userId,
          role: roleAction.role,
          targetName,
        });
        toast({
          title: t('admin.users.roleAdded'),
          description: t('admin.users.roleAddedDesc', { 
            role: roleAction.role, 
            user: roleAction.user.fullName || roleAction.user.email 
          }),
        });
      } else {
        await removeRole.mutateAsync({
          userId: roleAction.user.userId,
          role: roleAction.role,
          targetName,
        });
        toast({
          title: t('admin.users.roleRemoved'),
          description: t('admin.users.roleRemovedDesc', { 
            role: roleAction.role, 
            user: roleAction.user.fullName || roleAction.user.email 
          }),
        });
      }
    } catch (error: any) {
      toast({
        title: t('admin.users.error'),
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setRoleAction(null);
    }
  };

  const openEditDialog = (user: UserWithRole) => {
    setEditUser(user);
    setEditForm({
      fullName: user.fullName || '',
      email: user.email || '',
    });
  };

  const handleSaveUser = async () => {
    if (!editUser) return;
    setIsSaving(true);

    try {
      // Update profile (name)
      if (editForm.fullName !== editUser.fullName) {
        await adminUpdate.mutateAsync({
          userId: editUser.userId,
          action: 'updateProfile',
          data: { fullName: editForm.fullName },
        });
      }

      // Update email if changed
      if (editForm.email !== editUser.email) {
        await adminUpdate.mutateAsync({
          userId: editUser.userId,
          action: 'updateEmail',
          data: { email: editForm.email },
        });
      }

      toast({
        title: t('admin.users.updateSuccess'),
        description: t('admin.users.updateSuccessDesc'),
      });
      setEditUser(null);
    } catch (error: any) {
      toast({
        title: t('admin.users.error'),
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendPasswordReset = async () => {
    if (!editUser) return;
    setIsSendingReset(true);

    try {
      await adminUpdate.mutateAsync({
        userId: editUser.userId,
        action: 'sendPasswordReset',
      });

      toast({
        title: t('admin.users.passwordResetSent'),
        description: t('admin.users.passwordResetSentDesc', { email: editUser.email }),
      });
    } catch (error: any) {
      toast({
        title: t('admin.users.error'),
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSendingReset(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);

    try {
      await deleteUser.mutateAsync(deleteTarget.userId);
      toast({
        title: t('admin.users.deleteSuccess'),
        description: t('admin.users.deleteSuccessDesc', { 
          user: deleteTarget.fullName || deleteTarget.email 
        }),
      });
      setDeleteTarget(null);
    } catch (error: any) {
      toast({
        title: t('admin.users.error'),
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCreateUser = async () => {
    if (!createForm.email || !createForm.password) return;
    setIsCreating(true);

    try {
      await createUser.mutateAsync({
        email: createForm.email,
        password: createForm.password,
        fullName: createForm.fullName || undefined,
        role: createForm.role,
      });
      toast({
        title: t('admin.users.createSuccess'),
        description: t('admin.users.createSuccessDesc', { 
          email: createForm.email 
        }),
      });
      setShowCreateDialog(false);
      setCreateForm({ fullName: '', email: '', password: '', role: 'user' });
    } catch (error: any) {
      toast({
        title: t('admin.users.error'),
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const getInitials = (name: string | null, email: string | null) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return email?.charAt(0).toUpperCase() || 'U';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-serif text-3xl font-semibold">{t('admin.users.title')}</h1>
          <p className="text-muted-foreground mt-1">{t('admin.users.description')}</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          {t('admin.users.addUser')}
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t('admin.users.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="card-elevated rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('admin.users.user')}</TableHead>
              <TableHead>{t('admin.users.email')}</TableHead>
              <TableHead>{t('admin.users.roles')}</TableHead>
              <TableHead>{t('admin.users.language')}</TableHead>
              <TableHead>{t('admin.users.joined')}</TableHead>
              <TableHead className="text-right">{t('admin.users.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers?.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                      {user.avatarUrl ? (
                        <AvatarImage src={user.avatarUrl} alt={user.fullName || ''} />
                      ) : null}
                      <AvatarFallback className="bg-primary/10 text-primary text-sm">
                        {getInitials(user.fullName, user.email)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{user.fullName || t('admin.users.noName')}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{user.email}</TableCell>
                <TableCell>
                  <div className="flex gap-1 flex-wrap">
                    {user.roles.length > 0 ? (
                      user.roles.map((role) => {
                        const roleColors: Record<string, string> = {
                          admin: 'default',
                          listing_editor: 'outline',
                          agent: 'outline',
                          user: 'secondary',
                        };
                        const roleKeyMap: Record<string, string> = {
                          admin: 'admin.roles.admin',
                          listing_editor: 'admin.roles.listingEditor',
                          agent: 'admin.roles.agent',
                          user: 'admin.roles.user',
                        };
                        return (
                          <Badge
                            key={role}
                            variant={roleColors[role] as 'default' | 'outline' | 'secondary' || 'secondary'}
                            className="capitalize"
                          >
                            {t(roleKeyMap[role] || role)}
                          </Badge>
                        );
                      })
                    ) : (
                      <Badge variant="outline">{t('admin.users.noRoles')}</Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {user.languagePreference === 'en' ? '🇺🇸 EN' : '🇪🇸 ES'}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(user.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(user)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      {t('admin.users.edit')}
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Shield className="w-4 h-4 mr-1" />
                          {t('admin.users.roles')}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>{t('admin.roles.manageRoles')}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {ROLE_CONFIG_KEYS.map(({ role, labelKey, descKey, icon: Icon }) => {
                          const hasRole = user.roles.includes(role);
                          return (
                            <DropdownMenuItem
                              key={role}
                              onClick={() => setRoleAction({ 
                                user, 
                                action: hasRole ? 'remove' : 'add', 
                                role 
                              })}
                            >
                              <Icon className="w-4 h-4 mr-2" />
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <span>{t(labelKey)}</span>
                                  {hasRole && (
                                    <Badge variant="secondary" className="text-xs ml-2">{t('admin.roles.active')}</Badge>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground">{t(descKey)}</p>
                              </div>
                            </DropdownMenuItem>
                          );
                        })}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    {/* Delete button - hidden for current user */}
                    {user.userId !== currentUser?.id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteTarget(user)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredUsers?.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  {t('admin.users.noUsers')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Role Action Confirmation Dialog */}
      <AlertDialog open={!!roleAction} onOpenChange={() => setRoleAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {roleAction?.action === 'add' 
                ? t('admin.users.confirmAddRole') 
                : t('admin.users.confirmRemoveRole')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {roleAction?.action === 'add'
                ? t('admin.users.confirmAddRoleDesc', {
                    user: roleAction.user.fullName || roleAction.user.email,
                    role: roleAction.role,
                  })
                : t('admin.users.confirmRemoveRoleDesc', {
                    user: roleAction?.user.fullName || roleAction?.user.email,
                    role: roleAction?.role,
                  })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleRoleAction}>
              {t('common.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit User Dialog */}
      <Dialog open={!!editUser} onOpenChange={(open) => !open && setEditUser(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('admin.users.editUser')}</DialogTitle>
            <DialogDescription>{t('admin.users.editUserDesc')}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="edit-fullname">{t('admin.users.fullName')}</Label>
              <Input
                id="edit-fullname"
                value={editForm.fullName}
                onChange={(e) => setEditForm(prev => ({ ...prev, fullName: e.target.value }))}
                placeholder={t('admin.users.fullNamePlaceholder')}
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="edit-email">{t('admin.users.emailAddress')}</Label>
              <Input
                id="edit-email"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder={t('admin.users.emailPlaceholder')}
              />
            </div>

            {/* Password Reset Section */}
            <div className="pt-4 border-t border-border">
              <Label className="text-sm font-medium">{t('admin.users.password')}</Label>
              <p className="text-sm text-muted-foreground mt-1 mb-3">
                {t('admin.users.sendPasswordResetDesc')}
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={handleSendPasswordReset}
                disabled={isSendingReset}
              >
                {isSendingReset ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t('common.saving')}
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    {t('admin.users.sendPasswordReset')}
                  </>
                )}
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditUser(null)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleSaveUser} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('common.saving')}
                </>
              ) : (
                t('admin.users.saveChanges')
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('admin.users.confirmDelete')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('admin.users.confirmDeleteDesc', {
                user: deleteTarget?.fullName || deleteTarget?.email,
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteUser}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('admin.users.deleting')}
                </>
              ) : (
                t('admin.users.delete')
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create User Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('admin.users.createUser')}</DialogTitle>
            <DialogDescription>{t('admin.users.createUserDesc')}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="create-fullname">{t('admin.users.fullName')}</Label>
              <Input
                id="create-fullname"
                value={createForm.fullName}
                onChange={(e) => setCreateForm(prev => ({ ...prev, fullName: e.target.value }))}
                placeholder={t('admin.users.fullNamePlaceholder')}
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="create-email">{t('admin.users.emailAddress')} *</Label>
              <Input
                id="create-email"
                type="email"
                value={createForm.email}
                onChange={(e) => setCreateForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder={t('admin.users.emailPlaceholder')}
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="create-password">{t('admin.users.password')} *</Label>
              <div className="relative">
                <Input
                  id="create-password"
                  type={showPassword ? 'text' : 'password'}
                  value={createForm.password}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, password: e.target.value }))}
                  placeholder={t('admin.users.passwordPlaceholder')}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <PasswordStrengthIndicator password={createForm.password} />
            </div>

            {/* Role Selection */}
            <div className="space-y-2">
              <Label>{t('admin.users.assignRole')}</Label>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="create-role"
                    value="user"
                    checked={createForm.role === 'user'}
                    onChange={() => setCreateForm(prev => ({ ...prev, role: 'user' }))}
                    className="w-4 h-4 text-primary"
                  />
                  <span className="text-sm">{t('admin.users.roleUser')}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="create-role"
                    value="listing_editor"
                    checked={createForm.role === 'listing_editor'}
                    onChange={() => setCreateForm(prev => ({ ...prev, role: 'listing_editor' }))}
                    className="w-4 h-4 text-primary"
                  />
                  <span className="text-sm">{t('admin.roles.listingEditor')}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="create-role"
                    value="agent"
                    checked={createForm.role === 'agent'}
                    onChange={() => setCreateForm(prev => ({ ...prev, role: 'agent' }))}
                    className="w-4 h-4 text-primary"
                  />
                  <span className="text-sm">{t('admin.roles.agent')}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="create-role"
                    value="admin"
                    checked={createForm.role === 'admin'}
                    onChange={() => setCreateForm(prev => ({ ...prev, role: 'admin' }))}
                    className="w-4 h-4 text-primary"
                  />
                  <span className="text-sm">{t('admin.users.roleAdmin')}</span>
                </label>
              </div>
              <p className="text-xs text-muted-foreground">
                {t('admin.users.roleHint')}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              {t('common.cancel')}
            </Button>
            <Button 
              onClick={handleCreateUser} 
              disabled={isCreating || !createForm.email || !passwordStrength.isValid}
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('admin.users.creating')}
                </>
              ) : (
                t('admin.users.createUserBtn')
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
