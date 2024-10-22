export default {
    mounted(el, binding) {
        const options = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        const callback = (entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    el.src = binding.value;
                    observer.unobserve(el);
                }
            });
        };

        const observer = new IntersectionObserver(callback, options);
        observer.observe(el);
    }
};
