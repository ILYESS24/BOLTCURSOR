// Handle favicon.ico requests by redirecting to favicon.svg
export async function loader() {
  // Redirect to the actual favicon.svg file
  return new Response(null, {
    status: 302,
    headers: {
      Location: '/favicon.svg',
    },
  });
}
