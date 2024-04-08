package service

import (
	"fmt"
	"strings"

	"github.com/golang-jwt/jwt/v5"
	"github.com/pkg/errors"
)

type adminPermission string
type AdminPermissions []adminPermission

// Can checks if all permissions are given
func (p AdminPermissions) Can(perm ...adminPermission) bool {
	found := 0
	for _, e := range p {
		for _, o := range perm {
			if o == e {
				found++
			}
		}
	}
	return found == len(perm) && len(perm) > 0
}

// CanAny checks if any selected permissions are given
func (p AdminPermissions) CanAny(perm ...adminPermission) bool {
	found := 0
	for _, e := range p {
		for _, o := range perm {
			if o == e {
				found++
			}
		}
	}
	return (found) > 0
}

func (p AdminPermissions) StringArray() []string {
	results := make([]string, 0, len(p))
	for _, resource := range p {
		results = append(results, string(resource))
	}
	return results
}

// Claims is the claims for a JWT
type Claims struct {
	UserID      string           `json:"userID"`
	Permissions AdminPermissions `json:"permissions"`
	ApplID      string           `json:"applID"`
	jwt.RegisteredClaims
}

// Valid implement jwt.Claims
func (c Claims) Valid() error {
	return nil
}

func (c *Claims) String() string {
	return c.UserID + "-[" + strings.Join([]string(c.Permissions.StringArray()), ",") + "]"
}

// Extract builds a Claims struct from an jwt.Token
func Extract(i interface{}) (c *Claims, err error) {
	userToken, ok := i.(*jwt.Token)
	if !ok {
		return c, errors.New("No token")
	}
	claims, ok := userToken.Claims.(*Claims)
	if !ok {
		return c, errors.New("No claims in token")
	}
	return claims, nil
}

// ExtractPermissions builds a Permission array from context
func ExtractPermissions(i interface{}) (c AdminPermissions, err error) {
	perms, ok := i.(AdminPermissions)
	if !ok {
		return c, errors.New("No permissions")
	}
	c = perms

	return c, nil
}

// FromUnknown builds a Claims struct from an interface{}
func FromUnknown(i interface{}) (c Claims, err error) {
	var claimsMap map[string]interface{}
	if val, ok := i.(map[string]interface{}); ok {
		claimsMap = val
	} else if val, ok := i.(Claims); ok {
		return val, nil
	} else {
		err = errors.New("Couldn't parse user claims")
		return
	}

	if id, ok := claimsMap["user_id"].(string); ok {
		c.UserID = id
	} else {
		err = errors.New("Couldn't parse user ID")
	}

	if perm, ok := claimsMap["permissions"].([]interface{}); ok {
		for i := range perm {
			if str, k := perm[i].(adminPermission); k {
				c.Permissions = append(c.Permissions, str)
			} else {
				err = errors.New("Couldn't parse permission value")
				return c, err
			}
		}
	} else {
		err = errors.New("Couldn't parse user permissions")
	}

	return
}

// ExtractFromToken parses a JWT token and returns the Claims
func ExtractFromToken(token, secret string) (Claims, error) {
	tkn, err := parseToken(secret, token)
	if err != nil {
		return Claims{}, err
	}
	claims, ok := tkn.Claims.(*Claims)
	if !ok {
		return Claims{}, errors.New("No claims in token")
	}
	return *claims, nil
}

func parseToken(secret, tokenString string) (*jwt.Token, error) {
	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		// validate the alg is HMAC
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("Unexpected signing method: %v", token.Header["alg"])
		}

		return []byte(secret), nil
	})
	return token, err
}
