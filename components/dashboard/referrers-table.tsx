import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface Referrer {
  source: string
  visitors: number
}

interface ReferrersTableProps {
  referrers: Referrer[]
}

export function ReferrersTable({ referrers }: ReferrersTableProps) {
  const total = referrers.reduce((sum, ref) => sum + ref.visitors, 0)

  return (
    <Card className="overflow-hidden border-[#EAEAEA] bg-white transition-all hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900">
      <CardHeader className="pb-3 pt-5">
        <CardTitle className="text-base font-medium text-neutral-800 dark:text-neutral-200">Top Referrers</CardTitle>
        <CardDescription className="text-xs font-normal text-neutral-500 dark:text-neutral-400">
          Where your visitors are coming from
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0 pb-1">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Source</TableHead>
              <TableHead className="text-right text-xs font-medium text-neutral-500 dark:text-neutral-400">
                Visitors
              </TableHead>
              <TableHead className="text-right text-xs font-medium text-neutral-500 dark:text-neutral-400">
                Percentage
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {referrers.map((referrer) => (
              <TableRow
                key={referrer.source}
                className="border-b border-neutral-100 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800/50"
              >
                <TableCell className="py-3 font-medium text-neutral-700 dark:text-neutral-300">
                  {referrer.source}
                </TableCell>
                <TableCell className="py-3 text-right text-neutral-700 dark:text-neutral-300">
                  {referrer.visitors}
                </TableCell>
                <TableCell className="py-3 text-right text-neutral-500 dark:text-neutral-400">
                  {total > 0 ? `${Math.round((referrer.visitors / total) * 100)}%` : "0%"}
                </TableCell>
              </TableRow>
            ))}
            {referrers.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="py-6 text-center text-sm text-neutral-500 dark:text-neutral-400">
                  No referrer data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
