let setIsLoggedInFunction: ((value: boolean) => void) | null = null;

export const registerSetIsLoggedIn = (fn: (value: boolean) => void) => {
    setIsLoggedInFunction = fn;
};

export const setIsLoggedIn = (value: boolean) => {
    if (setIsLoggedInFunction) {
        setIsLoggedInFunction(value);
    }
};