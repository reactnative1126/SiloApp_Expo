import { useRecoilState } from 'recoil';

import { loadingAtom } from './normal.state';

function useNormalActions() {
    const [loading, setLoading] = useRecoilState(loadingAtom);

    async function loading(status) {
        setLoading({ loading: status });
    }

    return {
        loading
    }

}

export { useNormalActions };
