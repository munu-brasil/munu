package endpoint

func Find[T comparable](a []T, x T) (T, bool) {
	for _, n := range a {
		if x == n {
			return n, true
		}
	}
	empty := new(T)
	return *empty, false
}
