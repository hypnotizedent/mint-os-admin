/**
 * Jobs API Client
 * API functions for job-related operations including calendar views
 */

import type { Job, CapacityData, JobStatus, Priority } from '../types'

const STRAPI_API_URL = import.meta.env.VITE_STRAPI_API_URL || 'http://localhost:1337/api'

// Default daily capacity - can be overridden via environment variable
const DEFAULT_DAILY_CAPACITY = Number(import.meta.env.VITE_DAILY_JOB_CAPACITY) || 10

// Type for Strapi job response attributes
interface StrapiJobAttributes {
  title?: string
  name?: string
  customer?: {
    data?: {
      id?: number
      attributes?: {
        name?: string
      }
    }
  }
  customerName?: string
  customerId?: number | string
  status?: JobStatus
  priority?: Priority
  dueDate?: string
  createdAt?: string
  description?: string
  quantity?: number
  fileCount?: number
  assignedMachine?: string
  estimatedCost?: number
  progress?: number
}

// Type for Strapi job response item
interface StrapiJobItem {
  id: number
  attributes?: StrapiJobAttributes
}

// Helper to map Strapi job item to Job type
function mapStrapiJobToJob(item: StrapiJobItem): Job {
  const attrs: StrapiJobAttributes = item.attributes || (item as unknown as StrapiJobAttributes)
  return {
    id: String(item.id),
    title: attrs.title || attrs.name || 'Untitled Job',
    customer: attrs.customer?.data?.attributes?.name || attrs.customerName || 'Unknown',
    customerId: String(attrs.customer?.data?.id || attrs.customerId || ''),
    status: attrs.status || 'quote',
    priority: attrs.priority || 'normal',
    dueDate: attrs.dueDate || new Date().toISOString(),
    createdAt: attrs.createdAt || new Date().toISOString(),
    description: attrs.description || '',
    quantity: attrs.quantity || 0,
    fileCount: attrs.fileCount || 0,
    assignedMachine: attrs.assignedMachine || undefined,
    estimatedCost: attrs.estimatedCost || 0,
    progress: attrs.progress || 0,
  }
}

/**
 * Get jobs within a date range for calendar views
 */
export async function getJobsByDateRange(from: string, to: string): Promise<Job[]> {
  try {
    const token = localStorage.getItem('auth_token')
    
    const response = await fetch(
      `${STRAPI_API_URL}/jobs?filters[dueDate][$gte]=${from}&filters[dueDate][$lte]=${to}&populate=*`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch jobs by date range')
    }

    const result = await response.json()
    
    // Map Strapi response to Job type
    return (result.data || []).map((item: StrapiJobItem) => mapStrapiJobToJob(item))
  } catch (error) {
    console.error('Error fetching jobs by date range:', error)
    return []
  }
}

/**
 * Update a job's due date (for drag-and-drop rescheduling)
 */
export async function updateJobDueDate(jobId: string, newDate: string): Promise<Job | null> {
  try {
    const token = localStorage.getItem('auth_token')
    
    const response = await fetch(
      `${STRAPI_API_URL}/jobs/${jobId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({
          data: {
            dueDate: newDate,
          },
        }),
      }
    )

    if (!response.ok) {
      throw new Error('Failed to update job due date')
    }

    const result = await response.json()
    return mapStrapiJobToJob(result.data)
  } catch (error) {
    console.error('Error updating job due date:', error)
    return null
  }
}

/**
 * Get capacity data for a date range
 * Returns capacity utilization for each day
 */
export async function getCapacityByDate(from: string, to: string): Promise<CapacityData[]> {
  try {
    const token = localStorage.getItem('auth_token')
    
    // First, get all jobs in the range
    const response = await fetch(
      `${STRAPI_API_URL}/jobs?filters[dueDate][$gte]=${from}&filters[dueDate][$lte]=${to}&pagination[limit]=1000`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch capacity data')
    }

    const result = await response.json()
    const jobs: StrapiJobItem[] = result.data || []
    
    // Group jobs by date and calculate capacity
    const jobsByDate: Record<string, number> = {}
    
    jobs.forEach((item: StrapiJobItem) => {
      const attrs: StrapiJobAttributes = item.attributes || (item as unknown as StrapiJobAttributes)
      const dueDate = attrs.dueDate?.split('T')[0]
      if (dueDate) {
        jobsByDate[dueDate] = (jobsByDate[dueDate] || 0) + 1
      }
    })
    
    // Generate capacity data for each day in range
    const fromDate = new Date(from)
    const toDate = new Date(to)
    const capacityData: CapacityData[] = []
    
    // Default capacity of 10 jobs per day (this could be made configurable)
    const DAILY_CAPACITY = DEFAULT_DAILY_CAPACITY
    
    const currentDate = new Date(fromDate)
    while (currentDate <= toDate) {
      const dateStr = currentDate.toISOString().split('T')[0]
      const scheduledJobs = jobsByDate[dateStr] || 0
      const percentUtilized = Math.round((scheduledJobs / DAILY_CAPACITY) * 100)
      
      capacityData.push({
        date: dateStr,
        scheduledJobs,
        totalCapacity: DAILY_CAPACITY,
        percentUtilized: Math.min(percentUtilized, 100),
        isOverbooked: scheduledJobs > DAILY_CAPACITY,
      })
      
      currentDate.setDate(currentDate.getDate() + 1)
    }
    
    return capacityData
  } catch (error) {
    console.error('Error fetching capacity data:', error)
    return []
  }
}

/**
 * Update job status
 */
export async function updateJobStatus(jobId: string, status: string): Promise<Job | null> {
  try {
    const token = localStorage.getItem('auth_token')
    
    const response = await fetch(
      `${STRAPI_API_URL}/jobs/${jobId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({
          data: {
            status,
          },
        }),
      }
    )

    if (!response.ok) {
      throw new Error('Failed to update job status')
    }

    const result = await response.json()
    return mapStrapiJobToJob(result.data)
  } catch (error) {
    console.error('Error updating job status:', error)
    return null
  }
}
