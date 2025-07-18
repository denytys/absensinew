import { useRouteError } from "react-router-dom";

const ErrorPage = () => {
    const error = useRouteError();

    return (
        <div className="p-8 text-center text-red-600">
            <h1 className="text-3xl font-bold">Oops! An error occurred.</h1>
            <p className="mt-4">{error?.statusText || error?.message}</p>
        </div>
    );
};

export default ErrorPage;
