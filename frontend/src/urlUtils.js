export const updateUrlParams = (params) => {
    const newUrl = new URL(window.location.href);
    Object.entries(params).forEach(([key, value]) => {
        if (value) {
            newUrl.searchParams.set(key, value);
        } else {
            newUrl.searchParams.delete(key);
        }
    });
    window.history.pushState({}, '', newUrl.toString());
};

export const getUrlParams = () => {
    return new URLSearchParams(window.location.search);
};