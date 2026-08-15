import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  AppBar,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Drawer,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Add,
  AdminPanelSettings,
  Dashboard as DashboardIcon,
  Delete,
  Edit,
  Key,
  LockReset,
  Menu,
  People,
  Person,
  Refresh,
  Search,
  Shield,
  Visibility,
} from "@mui/icons-material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useKeycloak } from "@react-keycloak/web";
import { useNavigate } from "react-router-dom";
import CustomSnackbar from "../CustomSnackBar/CustomSnackBar";
import {
  CreateUserPayload,
  UpdateUserPayload,
  User,
  UserRole,
  UserService,
} from "../services/userService";

const drawerWidth = 248;
const roles: UserRole[] = ["SUPERADMIN", "ADMIN", "USER", "SUBUSER"];

const roleColors: Record<UserRole, "error" | "warning" | "primary" | "success"> = {
  SUPERADMIN: "error",
  ADMIN: "warning",
  USER: "primary",
  SUBUSER: "success",
};

const getDisplayName = (user?: User | string | number | null) => {
  if (!user) return "-";
  if (typeof user === "string" || typeof user === "number") return String(user);
  return user.username || [user.firstName, user.lastName].filter(Boolean).join(" ") || String(user.id);
};

const getTokenRole = (tokenParsed: any): UserRole => {
  const tokenRoles = [
    ...(tokenParsed?.realm_access?.roles || []),
    ...Object.values(tokenParsed?.resource_access || {}).flatMap((resource: any) => resource?.roles || []),
  ].map((role: string) => role.replace(/^ROLE_/, "").toUpperCase());

  return roles.find((role) => tokenRoles.includes(role)) || "USER";
};

const canManageRole = (currentRole: UserRole, targetRole?: UserRole) => {
  if (currentRole === "SUPERADMIN") return true;
  if (currentRole === "ADMIN") return targetRole === "USER" || targetRole === "SUBUSER";
  return false;
};

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Something went wrong. Please try again.";

const roleBadge = (role: UserRole) => (
  <Chip size="small" label={role} color={roleColors[role]} sx={{ fontWeight: 700 }} />
);

interface UserFormDialogProps {
  mode: "create" | "edit";
  open: boolean;
  onClose: () => void;
  onSubmit: (values: CreateUserPayload | UpdateUserPayload) => Promise<void>;
  users: User[];
  currentRole: UserRole;
  initialUser?: User | null;
}

const UserFormDialog: React.FC<UserFormDialogProps> = ({
  mode,
  open,
  onClose,
  onSubmit,
  users,
  currentRole,
  initialUser,
}) => {
  const isCreate = mode === "create";
  const allowedRoles = roles.filter((role) => canManageRole(currentRole, role));

  const validationSchema = Yup.object({
    username: isCreate ? Yup.string().required("Username is required") : Yup.string(),
    email: Yup.string().email("Enter a valid email").required("Email is required"),
    firstName: Yup.string().required("First name is required"),
    lastName: Yup.string().required("Last name is required"),
    password: isCreate ? Yup.string().required("Password is required") : Yup.string(),
    role: Yup.string().oneOf(allowedRoles).required("Role is required"),
    parentUserId: Yup.number()
      .nullable()
      .when("role", {
        is: "SUBUSER",
        then: (schema) => schema.required("Parent user is required for SUBUSER"),
        otherwise: (schema) => schema.nullable(),
      }),
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      username: initialUser?.username || "",
      email: initialUser?.email || "",
      firstName: initialUser?.firstName || "",
      lastName: initialUser?.lastName || "",
      password: "",
      role: (initialUser?.role && allowedRoles.includes(initialUser.role) ? initialUser.role : allowedRoles[0]) as UserRole,
      parentUserId:
        typeof initialUser?.parentUser === "object" && initialUser.parentUser
          ? initialUser.parentUser.id
          : "",
    },
    validationSchema,
    onSubmit: async (values) => {
      const parentUserId = values.role === "SUBUSER" ? Number(values.parentUserId) : null;
      if (isCreate) {
        await onSubmit({
          username: values.username,
          email: values.email,
          firstName: values.firstName,
          lastName: values.lastName,
          password: values.password,
          role: values.role,
          parentUser: parentUserId,
          parentUserId,
        });
      } else {
        await onSubmit({
          email: values.email,
          firstName: values.firstName,
          lastName: values.lastName,
          role: values.role,
        });
      }
    },
  });

  useEffect(() => {
    if (!open) formik.resetForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Dialog open={open} onClose={formik.isSubmitting ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>{isCreate ? "Create User" : `Edit ${initialUser?.username || "User"}`}</DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {isCreate && (
              <TextField
                name="username"
                label="Username"
                value={formik.values.username}
                onChange={formik.handleChange}
                error={formik.touched.username && Boolean(formik.errors.username)}
                helperText={formik.touched.username && formik.errors.username}
                fullWidth
              />
            )}
            <TextField
              name="email"
              label="Email"
              value={formik.values.email}
              onChange={formik.handleChange}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
              fullWidth
            />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="firstName"
                  label="First Name"
                  value={formik.values.firstName}
                  onChange={formik.handleChange}
                  error={formik.touched.firstName && Boolean(formik.errors.firstName)}
                  helperText={formik.touched.firstName && formik.errors.firstName}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="lastName"
                  label="Last Name"
                  value={formik.values.lastName}
                  onChange={formik.handleChange}
                  error={formik.touched.lastName && Boolean(formik.errors.lastName)}
                  helperText={formik.touched.lastName && formik.errors.lastName}
                  fullWidth
                />
              </Grid>
            </Grid>
            {isCreate && (
              <TextField
                name="password"
                label="Password"
                type="password"
                value={formik.values.password}
                onChange={formik.handleChange}
                error={formik.touched.password && Boolean(formik.errors.password)}
                helperText={formik.touched.password && formik.errors.password}
                fullWidth
              />
            )}
            <FormControl fullWidth error={formik.touched.role && Boolean(formik.errors.role)}>
              <InputLabel>Role</InputLabel>
              <Select name="role" label="Role" value={formik.values.role} onChange={formik.handleChange}>
                {allowedRoles.map((role) => (
                  <MenuItem key={role} value={role}>
                    {role}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {formik.values.role === "SUBUSER" && (
              <FormControl fullWidth error={formik.touched.parentUserId && Boolean(formik.errors.parentUserId)}>
                <InputLabel>Parent User</InputLabel>
                <Select
                  name="parentUserId"
                  label="Parent User"
                  value={formik.values.parentUserId}
                  onChange={formik.handleChange}
                >
                  {users
                    .filter((user) => user.role === "USER")
                    .map((user) => (
                      <MenuItem key={user.id} value={user.id}>
                        {user.username} - {user.email}
                      </MenuItem>
                    ))}
                </Select>
                {formik.touched.parentUserId && formik.errors.parentUserId && (
                  <Typography color="error" variant="caption" sx={{ ml: 2, mt: 0.5 }}>
                    {formik.errors.parentUserId}
                  </Typography>
                )}
              </FormControl>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={formik.isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={formik.isSubmitting}>
            {formik.isSubmitting ? "Saving..." : isCreate ? "Create User" : "Save Changes"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

interface ResetPasswordDialogProps {
  open: boolean;
  user: User | null;
  onClose: () => void;
  onSubmit: (password: string) => Promise<void>;
}

const ResetPasswordDialog: React.FC<ResetPasswordDialogProps> = ({ open, user, onClose, onSubmit }) => {
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: { newPassword: "", confirmPassword: "" },
    validationSchema: Yup.object({
      newPassword: Yup.string().required("Password is required"),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref("newPassword")], "Confirm password must match")
        .required("Confirm password is required"),
    }),
    onSubmit: async (values) => onSubmit(values.newPassword),
  });

  useEffect(() => {
    if (!open) formik.resetForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Dialog open={open} onClose={formik.isSubmitting ? undefined : onClose} fullWidth maxWidth="xs">
      <DialogTitle>Reset Password</DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Set a new password for {user?.username}.
          </Typography>
          <Stack spacing={2}>
            <TextField
              name="newPassword"
              label="New Password"
              type="password"
              value={formik.values.newPassword}
              onChange={formik.handleChange}
              error={formik.touched.newPassword && Boolean(formik.errors.newPassword)}
              helperText={formik.touched.newPassword && formik.errors.newPassword}
              fullWidth
            />
            <TextField
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              value={formik.values.confirmPassword}
              onChange={formik.handleChange}
              error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
              helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={formik.isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={formik.isSubmitting}>
            {formik.isSubmitting ? "Resetting..." : "Reset Password"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

interface DeleteDialogProps {
  open: boolean;
  user: User | null;
  deleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteDialog: React.FC<DeleteDialogProps> = ({ open, user, deleting, onClose, onConfirm }) => (
  <Dialog open={open} onClose={deleting ? undefined : onClose} fullWidth maxWidth="xs">
    <DialogTitle>Delete User</DialogTitle>
    <DialogContent>
      <Alert severity="warning" sx={{ mb: 2 }}>
        This user will be removed from both the local database and Keycloak.
      </Alert>
      <Typography>
        Delete <strong>{user?.username}</strong> with role {user?.role && roleBadge(user.role)}?
      </Typography>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} disabled={deleting}>
        Cancel
      </Button>
      <Button color="error" variant="contained" onClick={onConfirm} disabled={deleting}>
        {deleting ? "Deleting..." : "Delete User"}
      </Button>
    </DialogActions>
  </Dialog>
);

const UserManagementDashboard: React.FC = () => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const navigate = useNavigate();
  const { keycloak } = useKeycloak();
  const currentRole = getTokenRole(keycloak.tokenParsed);
  const loggedInName =
    keycloak.tokenParsed?.preferred_username ||
    keycloak.tokenParsed?.name ||
    keycloak.tokenParsed?.email ||
    "Logged in user";

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "ALL">("ALL");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [resetUser, setResetUser] = useState<User | null>(null);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [keycloakSyncStatus, setKeycloakSyncStatus] = useState("Not checked");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", type: "success" as "success" | "error" });

  const showSnackbar = (message: string, type: "success" | "error" = "success") => {
    setSnackbar({ open: true, message, type });
  };

  const loadUsers = async (preserveSelection = true) => {
    setLoading(true);
    setError("");
    try {
      const data = await UserService.fetchUsers();
      setUsers(data);
      if (preserveSelection && selectedUser) {
        setSelectedUser(data.find((user) => user.id === selectedUser.id) || null);
      } else if (!preserveSelection) {
        setSelectedUser(null);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const summary = useMemo(() => {
    const counts = roles.reduce(
      (acc, role) => ({ ...acc, [role]: users.filter((user) => user.role === role).length }),
      {} as Record<UserRole, number>
    );
    return { total: users.length, ...counts };
  }, [users]);

  const filteredUsers = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    return users.filter((user) => {
      const matchesRole = roleFilter === "ALL" || user.role === roleFilter;
      const searchable = [
        user.username,
        user.email,
        user.firstName,
        user.lastName,
        user.role,
        getDisplayName(user.createdBy),
        user.keycloakId,
        getDisplayName(user.parentUser),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return matchesRole && (!normalizedSearch || searchable.includes(normalizedSearch));
    });
  }, [roleFilter, searchTerm, users]);

  const visibleUsers = filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const canCreateUsers = currentRole === "SUPERADMIN" || currentRole === "ADMIN";
  const hasManagementAccess = currentRole === "SUPERADMIN" || currentRole === "ADMIN";

  const fetchUserDetails = async (user: User) => {
    setSelectedUser(user);
    try {
      const details = await UserService.fetchUserById(user.id);
      setSelectedUser(details);
    } catch (err) {
      showSnackbar(getErrorMessage(err), "error");
    }
  };

  const handleCreate = async (payload: CreateUserPayload | UpdateUserPayload) => {
    try {
      const created = await UserService.createUser(payload as CreateUserPayload);
      setCreateOpen(false);
      showSnackbar("User created in Keycloak and local database");
      await loadUsers();
      setSelectedUser(created);
    } catch (err) {
      showSnackbar(getErrorMessage(err), "error");
      throw err;
    }
  };

  const handleUpdate = async (payload: CreateUserPayload | UpdateUserPayload) => {
    if (!editUser) return;
    try {
      const updated = await UserService.updateUser(editUser.id, payload as UpdateUserPayload);
      setEditUser(null);
      setSelectedUser(updated);
      showSnackbar("User updated and role synced with Keycloak");
      await loadUsers();
    } catch (err) {
      showSnackbar(getErrorMessage(err), "error");
      throw err;
    }
  };

  const handleResetPassword = async (password: string) => {
    if (!resetUser) return;
    try {
      await UserService.resetPassword(resetUser.id, password);
      setResetUser(null);
      showSnackbar("Password reset successfully");
    } catch (err) {
      showSnackbar(getErrorMessage(err), "error");
      throw err;
    }
  };

  const handleDelete = async () => {
    if (!deleteUser) return;
    setDeleting(true);
    try {
      await UserService.deleteUser(deleteUser.id);
      showSnackbar("User deleted from Keycloak and local database");
      setDeleteUser(null);
      if (selectedUser?.id === deleteUser.id) setSelectedUser(null);
      await loadUsers();
    } catch (err) {
      showSnackbar(getErrorMessage(err), "error");
    } finally {
      setDeleting(false);
    }
  };

  const checkKeycloakSync = async () => {
    if (currentRole !== "SUPERADMIN") return;
    setKeycloakSyncStatus("Checking...");
    try {
      const keycloakUsers = await UserService.fetchAllKeycloakUsers();
      setKeycloakSyncStatus(`${keycloakUsers.length} Keycloak users found`);
      showSnackbar("Fetched Keycloak user list");
    } catch (err) {
      setKeycloakSyncStatus("Unavailable");
      showSnackbar(getErrorMessage(err), "error");
    }
  };

  const sidebar = (
    <Box sx={{ height: "100%", bgcolor: "#111827", color: "#fff" }}>
      <Toolbar sx={{ px: 3 }}>
        <Shield sx={{ mr: 1 }} />
        <Typography variant="h6" fontWeight={800}>
          User Admin
        </Typography>
      </Toolbar>
      <Divider sx={{ borderColor: "rgba(255,255,255,0.12)" }} />
      <List>
        <ListItemButton selected sx={{ "&.Mui-selected": { bgcolor: "rgba(255,255,255,0.12)" } }}>
          <ListItemIcon sx={{ color: "#fff" }}>
            <People />
          </ListItemIcon>
          <ListItemText primary="Users" />
        </ListItemButton>
        <ListItemButton onClick={() => navigate("/dashboard")}>
          <ListItemIcon sx={{ color: "#fff" }}>
            <DashboardIcon />
          </ListItemIcon>
          <ListItemText primary="Main Dashboard" />
        </ListItemButton>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f3f4f6" }}>
      <CustomSnackbar
        open={snackbar.open}
        handleClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
        type={snackbar.type}
      />
      {isDesktop ? (
        <Drawer variant="permanent" sx={{ width: drawerWidth, flexShrink: 0, "& .MuiDrawer-paper": { width: drawerWidth } }}>
          {sidebar}
        </Drawer>
      ) : (
        <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} sx={{ "& .MuiDrawer-paper": { width: drawerWidth } }}>
          {sidebar}
        </Drawer>
      )}

      <Box component="main" sx={{ flexGrow: 1, minWidth: 0 }}>
        <AppBar position="sticky" color="inherit" elevation={1}>
          <Toolbar sx={{ gap: 2 }}>
            {!isDesktop && (
              <IconButton onClick={() => setDrawerOpen(true)}>
                <Menu />
              </IconButton>
            )}
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" fontWeight={800}>
                User Management
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Manage local users synced with Keycloak
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <Avatar sx={{ bgcolor: "primary.main", width: 36, height: 36 }}>
                <Person fontSize="small" />
              </Avatar>
              <Box sx={{ display: { xs: "none", sm: "block" } }}>
                <Typography variant="body2" fontWeight={700}>
                  {loggedInName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {currentRole}
                </Typography>
              </Box>
            </Stack>
          </Toolbar>
        </AppBar>

        <Box sx={{ p: { xs: 2, md: 3 } }}>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {[
              { label: "Total Users", value: summary.total, icon: <People /> },
              { label: "Super Admins", value: summary.SUPERADMIN, icon: <Shield /> },
              { label: "Admins", value: summary.ADMIN, icon: <AdminPanelSettings /> },
              { label: "Users", value: summary.USER, icon: <Person /> },
              { label: "Subusers", value: summary.SUBUSER, icon: <People /> },
              { label: "Keycloak Sync", value: keycloakSyncStatus, icon: <Key /> },
            ].map((card) => (
              <Grid item xs={12} sm={6} lg={2} key={card.label}>
                <Paper sx={{ p: 2, height: "100%", borderRadius: 2 }}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Avatar sx={{ bgcolor: "primary.light", color: "primary.dark", width: 40, height: 40 }}>
                      {card.icon}
                    </Avatar>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="caption" color="text.secondary">
                        {card.label}
                      </Typography>
                      <Typography variant="h6" fontWeight={800} noWrap>
                        {card.value}
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Grid>
            ))}
          </Grid>

          <Paper sx={{ p: 2, mb: 2, borderRadius: 2 }}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ md: "center" }}>
              <TextField
                value={searchTerm}
                onChange={(event) => {
                  setSearchTerm(event.target.value);
                  setPage(0);
                }}
                placeholder="Search username, email, name, role"
                size="small"
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
              <FormControl size="small" sx={{ minWidth: 180 }}>
                <InputLabel>Role</InputLabel>
                <Select
                  value={roleFilter}
                  label="Role"
                  onChange={(event) => {
                    setRoleFilter(event.target.value as UserRole | "ALL");
                    setPage(0);
                  }}
                >
                  <MenuItem value="ALL">All Roles</MenuItem>
                  {roles.map((role) => (
                    <MenuItem key={role} value={role}>
                      {role}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Tooltip title="Refresh users">
                <IconButton onClick={() => loadUsers()} disabled={loading}>
                  <Refresh />
                </IconButton>
              </Tooltip>
              {currentRole === "SUPERADMIN" && (
                <Button variant="outlined" startIcon={<Key />} onClick={checkKeycloakSync}>
                  Keycloak Users
                </Button>
              )}
              {canCreateUsers && (
                <Button variant="contained" startIcon={<Add />} onClick={() => setCreateOpen(true)}>
                  Create User
                </Button>
              )}
            </Stack>
          </Paper>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={2}>
            <Grid item xs={12} lg={selectedUser ? 8 : 12}>
              <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      {["ID", "Username", "First Name", "Last Name", "Email", "Role", "Created By", "Keycloak ID", "Parent User", "Actions"].map(
                        (column) => (
                          <TableCell key={column} sx={{ fontWeight: 800 }}>
                            {column}
                          </TableCell>
                        )
                      )}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading && (
                      <TableRow>
                        <TableCell colSpan={10} align="center" sx={{ py: 6 }}>
                          <CircularProgress size={28} />
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Loading users...
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                    {!loading && visibleUsers.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={10} align="center" sx={{ py: 6 }}>
                          <Typography fontWeight={700}>No users found</Typography>
                          <Typography variant="body2" color="text.secondary">
                            Try a different search or role filter.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                    {!loading &&
                      visibleUsers.map((user) => {
                        const canManage = hasManagementAccess && canManageRole(currentRole, user.role);
                        return (
                          <TableRow hover key={user.id} selected={selectedUser?.id === user.id}>
                            <TableCell>{user.id}</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>{user.username}</TableCell>
                            <TableCell>{user.firstName || "-"}</TableCell>
                            <TableCell>{user.lastName || "-"}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{roleBadge(user.role)}</TableCell>
                            <TableCell>{getDisplayName(user.createdBy)}</TableCell>
                            <TableCell sx={{ maxWidth: 180 }} title={user.keycloakId || ""}>
                              <Typography variant="body2" noWrap>
                                {user.keycloakId || "-"}
                              </Typography>
                            </TableCell>
                            <TableCell>{getDisplayName(user.parentUser)}</TableCell>
                            <TableCell>
                              <Stack direction="row" spacing={0.5}>
                                <Tooltip title="View details">
                                  <IconButton size="small" onClick={() => fetchUserDetails(user)}>
                                    <Visibility fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                {canManage && (
                                  <>
                                    <Tooltip title="Edit user">
                                      <IconButton size="small" onClick={() => setEditUser(user)}>
                                        <Edit fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Reset password">
                                      <IconButton size="small" onClick={() => setResetUser(user)}>
                                        <LockReset fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Delete user">
                                      <IconButton size="small" color="error" onClick={() => setDeleteUser(user)}>
                                        <Delete fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  </>
                                )}
                              </Stack>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[10, 25, 50]}
                component="div"
                count={filteredUsers.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={(_, newPage) => setPage(newPage)}
                onRowsPerPageChange={(event) => {
                  setRowsPerPage(Number(event.target.value));
                  setPage(0);
                }}
              />
            </Grid>

            {selectedUser && (
              <Grid item xs={12} lg={4}>
                <Paper sx={{ p: 3, borderRadius: 2 }}>
                  <Stack spacing={2}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Box>
                        <Typography variant="h6" fontWeight={800}>
                          {selectedUser.username}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {[selectedUser.firstName, selectedUser.lastName].filter(Boolean).join(" ") || selectedUser.email}
                        </Typography>
                      </Box>
                      {roleBadge(selectedUser.role)}
                    </Stack>
                    <Divider />
                    {[
                      ["Local ID", selectedUser.id],
                      ["Keycloak ID", selectedUser.keycloakId || "-"],
                      ["Email", selectedUser.email],
                      ["Created By", getDisplayName(selectedUser.createdBy)],
                      ["Parent User", getDisplayName(selectedUser.parentUser)],
                    ].map(([label, value]) => (
                      <Box key={label}>
                        <Typography variant="caption" color="text.secondary">
                          {label}
                        </Typography>
                        <Typography sx={{ overflowWrap: "anywhere" }}>{value}</Typography>
                      </Box>
                    ))}
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Sub-users
                      </Typography>
                      {selectedUser.subUsers?.length ? (
                        <Stack spacing={1} sx={{ mt: 1 }}>
                          {selectedUser.subUsers.map((subUser) => (
                            <Paper key={subUser.id} variant="outlined" sx={{ p: 1.25 }}>
                              <Typography variant="body2" fontWeight={700}>
                                {subUser.username}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {subUser.email}
                              </Typography>
                            </Paper>
                          ))}
                        </Stack>
                      ) : (
                        <Typography>-</Typography>
                      )}
                    </Box>
                    {hasManagementAccess && canManageRole(currentRole, selectedUser.role) && (
                      <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                        <Button fullWidth variant="outlined" startIcon={<Edit />} onClick={() => setEditUser(selectedUser)}>
                          Edit User
                        </Button>
                        <Button fullWidth variant="outlined" startIcon={<LockReset />} onClick={() => setResetUser(selectedUser)}>
                          Reset Password
                        </Button>
                        <Button fullWidth color="error" variant="outlined" startIcon={<Delete />} onClick={() => setDeleteUser(selectedUser)}>
                          Delete
                        </Button>
                      </Stack>
                    )}
                  </Stack>
                </Paper>
              </Grid>
            )}
          </Grid>
        </Box>
      </Box>

      <UserFormDialog
        mode="create"
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreate}
        users={users}
        currentRole={currentRole}
      />
      <UserFormDialog
        mode="edit"
        open={Boolean(editUser)}
        onClose={() => setEditUser(null)}
        onSubmit={handleUpdate}
        users={users}
        currentRole={currentRole}
        initialUser={editUser}
      />
      <ResetPasswordDialog
        open={Boolean(resetUser)}
        user={resetUser}
        onClose={() => setResetUser(null)}
        onSubmit={handleResetPassword}
      />
      <DeleteDialog
        open={Boolean(deleteUser)}
        user={deleteUser}
        deleting={deleting}
        onClose={() => setDeleteUser(null)}
        onConfirm={handleDelete}
      />
    </Box>
  );
};

export default UserManagementDashboard;
