/**
 * Admin Layout
 * Full admin dashboard for owners
 * Now uses dashboard-api.ts to fetch real Printavo data from port 3335
 */

import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { DashboardPage } from "@/components/dashboard/DashboardPage";
import { JobsPage } from "@/components/jobs/JobsPage";
import { ProductionScheduleView } from "@/components/machines/ProductionScheduleView";
import { CustomersPage } from "@/components/customers/CustomersPage";
import { CustomerDetailPage } from "@/components/customers/CustomerDetailPage";
import { OrderDetailPage } from "@/components/orders/OrderDetailPage";
import { FilesPage } from "@/components/files/FilesPage";
import { ReportsPage } from "@/components/reports/ReportsPage";
import { SettingsPage } from "@/components/settings/SettingsPage";
import { ProductionPage } from "@/components/production/ProductionPage";
import LabelsDemo from "@/pages/LabelsDemo";
import { QuoteBuilder } from "@/components/quotes/QuoteBuilder";
import { ProductsPage } from "@/components/products/ProductsPage";
import { ShippingLabelForm } from "@/components/shipping/ShippingLabelForm";
import { AIAssistantPage } from "@/pages/AIAssistantPage";
import { ShipmentTracking } from "@/components/shipping/ShipmentTracking";
import { InvoicesPage } from "@/components/invoices/InvoicesPage";
import { SkipNavLink, SkipNavContent } from "@/components/ui/skip-nav";
import { PageLoading } from "@/components/ui/states";
import type { Job, Customer, Machine, FileItem, DashboardStats } from "@/lib/types";
import { toast } from "sonner";
import { dashboardApi, type Order, type ProductionStats } from "@/lib/dashboard-api";

export function AdminLayout() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState<string>("dashboard");
  console.log("AdminLayout initial currentPage:", "dashboard");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [machines] = useState<Machine[]>([]);
  const [files] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [productionStats, setProductionStats] = useState<ProductionStats | null>(null);
  const [totalOrders, setTotalOrders] = useState(0);
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [dashboardStats, setDashboardStats] = useState<{ newQuotes: number; inProduction: number; revenueMTD: number; dueThisWeek: number } | null>(null);

  // Fetch data from dashboard API (port 3335)
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch production stats
        const statsData = await dashboardApi.getProductionStats();
        setProductionStats(statsData);

        // Fetch orders (first 100 for display)
        const ordersData = await dashboardApi.getOrders({ limit: 100 });
        setTotalOrders(ordersData.total);

        // Transform orders to jobs format
        const transformedJobs: Job[] = ordersData.orders.map((o: Order) => {
          const statusMap: Record<string, Job["status"]> = {
            "QUOTE": "quote",
            "QUOTE_SENT": "quote",
            "Quote Out For Approval - Email": "quote",
            "PENDING": "design",
            "IN_PRODUCTION": "printing",
            "Screen Print Production": "printing",
            "Embroidery Production": "printing",
            "DTG Production": "printing",
            "READY_TO_SHIP": "finishing",
            "Fulfillment": "finishing",
            "SHIPPED": "delivery",
            "DELIVERED": "completed",
            "COMPLETE": "completed",
            "INVOICE PAID": "completed",
            "CANCELLED": "cancelled",
          };

          const totalQuantity = o.line_items?.reduce(
            (sum, item) => sum + (item.total_quantity || 0),
            0
          ) || 0;

          return {
            id: o.id.toString(),
            title: o.order_nickname || `Order #${o.order_number}`,
            customer: o.customer_name || "Unknown Customer",
            customerId: "",
            status: statusMap[o.status || ""] || "quote",
            priority: "normal" as const,
            dueDate: o.due_date || new Date().toISOString(),
            createdAt: o.due_date || new Date().toISOString(),
            description: o.production_notes || o.notes || "",
            quantity: totalQuantity,
            fileCount: o.artwork_count || 0,
            estimatedCost: parseFloat(o.total_amount) || 0,
            progress: o.status === "COMPLETE" || o.status === "INVOICE PAID" ? 100 : 50,
          };
        });
        setJobs(transformedJobs);

        // Fetch customers directly from API (all customers with order stats)
        try {
          const customersData = await dashboardApi.getCustomers({ limit: 5000 });
          const transformedCustomers: Customer[] = customersData.customers.map(c => ({
            id: c.id,
            name: c.name,
            email: c.email,
            phone: c.phone,
            company: c.company,
            totalOrders: c.totalOrders,
            totalRevenue: c.paidRevenue, // Use paid revenue, not total
            paidRevenue: c.paidRevenue,
            quoteTotal: c.quoteTotal,
            lastOrderDate: c.lastOrderDate,
            status: c.status as "active" | "inactive",
          }));
          setCustomers(transformedCustomers);
        } catch (e) {
          console.error("Failed to fetch customers:", e);
          // Fallback: Build customers from orders if API fails
          const customerMap = new Map<string, Customer>();
          ordersData.orders.forEach((o: Order) => {
            if (o.customer_name && !customerMap.has(o.customer_name)) {
              customerMap.set(o.customer_name, {
                id: o.customer_name,
                name: o.customer_name,
                email: "",
                phone: "",
                company: "",
                totalOrders: 0,
                totalRevenue: 0,
                lastOrderDate: o.due_date || new Date().toISOString(),
                status: "active" as const,
              });
            }
            const existing = customerMap.get(o.customer_name);
            if (existing) {
              existing.totalOrders++;
              existing.totalRevenue += parseFloat(o.total_amount) || 0;
            }
          });
          setCustomers(Array.from(customerMap.values()));
        }

        // Fetch recent active jobs for sidebar
        try {
          const recentJobsData = await dashboardApi.getRecentJobs();
          const transformedRecentJobs: Job[] = recentJobsData.jobs.map((j) => ({
            id: j.id.toString(),
            title: j.order_nickname || `Order #${j.order_number}`,
            customer: j.customer_name || "Unknown Customer",
            customerId: "",
            status: "printing" as const,
            priority: "normal" as const,
            dueDate: j.due_date || new Date().toISOString(),
            createdAt: j.created_at || new Date().toISOString(),
            description: j.printavo_status_name || "",
            quantity: 0,
            fileCount: 0,
            estimatedCost: parseFloat(j.total_amount) || 0,
            progress: 50,
          }));
          setRecentJobs(transformedRecentJobs);

        // Fetch dashboard stats for stat cards
        try {
          const statsData = await dashboardApi.getDashboardStats();
          setDashboardStats(statsData);
        } catch (e) {
          console.error("Failed to fetch dashboard stats:", e);
        }
        } catch (e) {
          console.error("Failed to fetch recent jobs:", e);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast.error("Failed to load dashboard data", {
          description: "Check if the dashboard API is running on port 3335",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const activeJobsList = jobs.filter(
    (j) => j.status !== "completed" && j.status !== "cancelled"
  );

  // Build stats from dashboard stats API (new) and production stats API (legacy)
  const stats: DashboardStats = {
    // New stats from /api/dashboard-stats
    newQuotes: dashboardStats?.newQuotes ?? 0,
    inProduction: dashboardStats?.inProduction ?? 0,
    dueThisWeek: dashboardStats?.dueThisWeek ?? 0,
    // Revenue from dashboard stats
    revenue: dashboardStats?.revenueMTD ?? 0,
    // Legacy stats from production stats
    activeJobs: productionStats ? parseInt(productionStats.total) - parseInt(productionStats.complete) : activeJobsList.length,
    completedToday: productionStats ? parseInt(productionStats.complete) : jobs.filter((j) => j.status === "completed").length,
    machinesOnline: machines.filter((m) => m.status !== "offline").length,
    lowStockItems: 0,
    urgentJobs: productionStats ? parseInt(productionStats.fulfillment) : 0,
  };


  const handleUpdateJob = (jobId: string, updates: Partial<Job>) => {
    console.log("Update job:", jobId, updates);
  };

  const handleViewCustomer = (customerId: string) => {
    setSelectedCustomerId(customerId);
    setCurrentPage("customer-detail");
  };

  const handleNewOrder = (customerId: string) => {
    setSelectedCustomerId(customerId);
    setCurrentPage("quotes");
    toast.success("Creating new quote", {
      description: "Customer info has been pre-filled",
    });
  };

  const handleBackFromCustomer = () => {
    setSelectedCustomerId(null);
    setCurrentPage("customers");
  };

  const handleViewOrder = (orderId: string) => {
    setSelectedOrderId(orderId);
    setCurrentPage("order-detail");
  };

  const handleBackFromOrder = () => {
    setSelectedOrderId(null);
    if (selectedCustomerId) {
      setCurrentPage("customer-detail");
    } else {
      setCurrentPage("jobs");
    }
  };

  const renderPage = () => { console.log("renderPage called with currentPage:", currentPage);
    switch (currentPage) {
      case "dashboard":
        return (
          <DashboardPage
            stats={stats}
            recentJobs={recentJobs}
            machines={machines}
            onNavigate={setCurrentPage}
            onViewOrder={handleViewOrder}
          />
        );
      case "production":
        return <ProductionPage />;
      case "jobs":
        return (
          <JobsPage
            jobs={activeJobsList}
            onUpdateJob={handleUpdateJob}
            onViewOrder={handleViewOrder}
          />
        );
      case "machines":
        return <ProductionScheduleView />;
      case "customers":
        return (
          <CustomersPage
            customers={customers}
            onViewCustomer={handleViewCustomer}
            onNewOrder={handleNewOrder}
          />
        );
      case "customer-detail":
        return selectedCustomerId ? (
          <CustomerDetailPage
            customerId={selectedCustomerId}
            onBack={handleBackFromCustomer}
            onNewOrder={handleNewOrder}
            onViewOrder={handleViewOrder}
          />
        ) : (
          <CustomersPage
            customers={customers}
            onViewCustomer={handleViewCustomer}
            onNewOrder={handleNewOrder}
          />
        );
      case "order-detail":
        return selectedOrderId ? (
          <OrderDetailPage orderId={selectedOrderId} onBack={handleBackFromOrder} />
        ) : (
          <JobsPage jobs={jobs} onUpdateJob={handleUpdateJob} onViewOrder={handleViewOrder} />
        );
      case "files":
        return <FilesPage files={files} />;
      case "reports":
        return <ReportsPage />;
      case "settings":
        return <SettingsPage />;
      case "labels-demo":
        return <LabelsDemo />;
      case "quotes":
        return <QuoteBuilder />;
      case "products":
        return <ProductsPage />;
      case "shipping":
        return <ShippingLabelForm />;
      case "tracking":
        return <ShipmentTracking />;
      case "invoices":
        return <InvoicesPage onViewOrder={handleViewOrder} />;
      case "ai-assistant":
        return <AIAssistantPage />;
      default:
        return (
          <DashboardPage
            stats={stats}
            recentJobs={recentJobs}
            machines={machines}
            onNavigate={setCurrentPage}
            onViewOrder={handleViewOrder}
          />
        );
    }
  };

  return (
    <ProtectedRoute allowedUserTypes={["owner"]}>
      <div className="flex min-h-screen bg-background">
        <SkipNavLink />
        <AppSidebar currentPage={currentPage} onNavigate={setCurrentPage} />
        <SkipNavContent className="flex-1 min-w-0">
          <main className="flex-1 overflow-auto bg-background min-w-0" role="main" aria-label="Main content">
            <div className="w-full p-6">
              {isLoading ? (
                <PageLoading message={`Loading dashboard... (${totalOrders.toLocaleString()} orders)`} />
              ) : (
                <>
                  {renderPage()}
                </>
              )}
            </div>
          </main>
        </SkipNavContent>
      </div>
    </ProtectedRoute>
  );
}

export default AdminLayout;
