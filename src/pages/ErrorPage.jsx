import { WarningOutlined } from '@ant-design/icons';
import React from 'react';
import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom';
const ErrorPage = () => {
    const error = useRouteError();
    let errorMessage = ""

    if (isRouteErrorResponse(error)) {
        errorMessage = error.error?.message || error.statusText;
    } else if (error instanceof Error) {
        errorMessage = error.message;
    } else if (typeof error === 'string') {
        errorMessage = error;
    }
    return (
        <main className="grid min-h-full place-items-center bg-white px-6 py-24 sm:py-32 lg:px-8">
            <div className="text-center">
                <WarningOutlined className='text-5xl transition-transform' />
                <h1 className="mt-4 text-3xl font-semibold tracking-tight text-balance text-gray-900 sm:text-7xl">
                    {errorMessage ? "Terjadi kesalahan" : "Page not found"}
                </h1>
                <p className="mt-6 text-lg font-medium text-pretty text-gray-500 sm:text-xl/8">
                    {errorMessage ? errorMessage : "Sorry, we couldn't find the page you're looking for."}
                </p>
                <div className="mt-10 flex items-center justify-center gap-x-6">
                    <Link
                        to="/"
                        className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                        Go back home
                    </Link>
                </div>
            </div>
        </main>
        // <div className="p-8 text-center text-red-600">
        //     <h1 className="text-3xl font-bold">Oops! An error occurred.</h1>
        //     <p className="mt-4">{errorMessage || errorMessage}</p>
        // </div>
    );
};

export default ErrorPage;
