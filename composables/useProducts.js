export const useProducts = () => {
    const products = ref([]);
    const categories = ref([]);
    const subcategories = ref([]);
    const loading = ref(false);
    const error = ref(null);
    const api = "http://192.168.63.238:8000"; // API HERE


    const fetchDatas = async () => {
        loading.value = true;
        error.value = null;

        try {
            const response = await fetch('/api/products');
            if (!response.ok) {
                throw new Error('Failed to fetch products');
            }
            products.value = await response.json();
        } catch (err) {
            error.value = err.message;
        } finally {
            loading.value = false;
        }
    };

    return {
        products,
        categories,
        subcategories,
        loading,
        error,
        fetchDatas
    };
}