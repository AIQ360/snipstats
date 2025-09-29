"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface TopPage {
  page_path: string
  page_views: number
  avg_engagement_time?: number
}

interface TopPagesTableProps {
  pages: TopPage[]
}

// Helper function to format seconds into minutes and seconds
function formatEngagementTime(seconds: number): string {
  if (!seconds) return "-"

  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)

  return `${minutes}m ${remainingSeconds}s`
}

export function TopPagesTable({ pages }: TopPagesTableProps) {
  const [showAll, setShowAll] = useState(false)

  // Initial display limit
  const displayLimit = 10
  const hasMore = pages.length > displayLimit
  const displayedPages = showAll ? pages : pages.slice(0, displayLimit)
  const hiddenCount = pages.length - displayLimit

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Pages</CardTitle>
        <CardDescription>Your most viewed pages</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Page</TableHead>
              <TableHead className="text-right">Views</TableHead>
              <TableHead className="text-right">Engagement Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedPages.map((page) => (
              <TableRow key={page.page_path}>
                <TableCell className="font-medium">
                  {page.page_path.length > 30 ? `${page.page_path.substring(0, 30)}...` : page.page_path}
                </TableCell>
                <TableCell className="text-right">{page.page_views}</TableCell>
                <TableCell className="text-right">{formatEngagementTime(page.avg_engagement_time || 0)}</TableCell>
              </TableRow>
            ))}
            {pages.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">
                  No page data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {hasMore && (
          <div className="mt-2">
            {!showAll ? (
              <Button
                variant="link"
                className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => setShowAll(true)}
              >
                + {hiddenCount} more pages
              </Button>
            ) : (
              <Button
                variant="link"
                className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => setShowAll(false)}
              >
                Show less
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
