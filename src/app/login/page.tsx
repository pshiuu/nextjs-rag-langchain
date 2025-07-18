import { login, signup } from './actions'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <form className="w-full max-w-sm p-8 space-y-6 bg-card rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center text-card-foreground">
          Welcome
        </h1>
        <div className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block mb-2 text-sm font-medium text-card-foreground"
            >
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              name="email"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block mb-2 text-sm font-medium text-card-foreground"
            >
              Password
            </label>
            <Input
              id="password"
              type="password"
              name="password"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Button formAction={login} className="w-full">
            Sign In
          </Button>
          <Button formAction={signup} className="w-full" variant="outline">
            Sign Up
          </Button>
        </div>
      </form>
    </div>
  )
}