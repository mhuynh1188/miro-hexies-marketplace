// app/page.tsx
export default function Home() {
    return (
      <main className="flex min-h-screen flex-col items-center justify-between p-24">
        <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
          <h1 className="text-4xl font-bold">Hexies Backend API</h1>
          <p className="text-xl mt-4">Backend server is running!</p>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <a 
              href="/api/health" 
              className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100"
            >
              <h2 className="mb-3 text-2xl font-semibold">
                Health Check{' '}
                <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                  -&gt;
                </span>
              </h2>
              <p className="m-0 max-w-[30ch] text-sm opacity-50">
                Test the API health endpoint
              </p>
            </a>
          </div>
        </div>
      </main>
    );
  }