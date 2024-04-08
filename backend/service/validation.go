package service

import (
	"regexp"
	"strconv"
	"strings"
)

func HasDigitsAndCharacters(p string) bool {
	isNotDigit := func(c rune) bool { return c < '0' || c > '9' }
	isDigit := func(c rune) bool { return c >= '0' && c <= '9' }

	hasD := strings.IndexFunc(p, isDigit) != -1
	hasNonD := strings.IndexFunc(p, isNotDigit) != -1

	return hasD && hasNonD
}

func ValidateCPF(cpfNumber string) bool {
	reg := regexp.MustCompile(`[^\d]+`)
	cpf := reg.ReplaceAllString(cpfNumber, "")
	if cpf == "" {
		return false
	}
	// Elimina CPFs invalidos conhecidos
	if len(cpf) != 11 ||
		cpf == "00000000000" ||
		cpf == "11111111111" ||
		cpf == "22222222222" ||
		cpf == "33333333333" ||
		cpf == "44444444444" ||
		cpf == "55555555555" ||
		cpf == "66666666666" ||
		cpf == "77777777777" ||
		cpf == "88888888888" ||
		cpf == "99999999999" {
		return false
	}
	// Valida 1o digito
	add := 0
	for i := 0; i < 9; i++ {
		ind := i - 1
		if ind < 0 {
			ind = 0
		}
		x, err := strconv.ParseInt(string(cpf[i]), 10, 64)
		if err != nil {
			return false
		}
		add += int(x) * (10 - i)
	}
	rev := 11 - (add % 11)
	if rev == 10 || rev == 11 {
		rev = 0
	}
	n, err := strconv.ParseInt(string(cpf[9]), 10, 64)
	if rev != int(n) || err != nil {
		return false
	}
	// Valida 2o digito
	add = 0
	for i := 0; i < 10; i++ {
		x, err := strconv.ParseInt(string(cpf[i]), 10, 64)
		if err != nil {
			return false
		}
		add += int(x) * (11 - i)
	}
	rev = 11 - (add % 11)
	if rev == 10 || rev == 11 {
		rev = 0
	}
	n, err = strconv.ParseInt(string(cpf[10]), 10, 64)
	return rev == int(n) && err == nil
}
