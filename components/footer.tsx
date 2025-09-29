export function Footer() {
  return (
    <footer className="border-t">
      <div className="container py-2 text-center text-sm text-muted-foreground space-y-2">
        <div className="flex justify-center gap-4">
          <a href="/privacy-policy" className="hover:underline">
            Privacy Policy
          </a>
          <span>|</span>
          <a href="/terms" className="hover:underline">
            Terms of Service
          </a>
        </div>
        <div>&copy; {new Date().getFullYear()} SnipStats. All rights reserved.</div>
      </div>
    </footer>
  )
}
