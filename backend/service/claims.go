package service

import (
	"database/sql/driver"
	"encoding/json"
	"fmt"
	"strings"

	"github.com/golang-jwt/jwt/v5"
	"github.com/munu-brasil/munu/backend/lib/array"
	"github.com/pkg/errors"
)

type userRoles string
type userPermissions string
type UserRoles []userRoles
type UserPermissions []userPermissions

// Can checks if all permissions are given
func (p UserPermissions) Can(perm ...userPermissions) bool {
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
func (p UserPermissions) CanAny(perm ...userPermissions) bool {
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

func (p UserPermissions) StringArray() []string {
	results := make([]string, 0, len(p))
	for _, resource := range p {
		results = append(results, string(resource))
	}
	return results
}

func (p UserRoles) StringArray() []string {
	results := make([]string, 0, len(p))
	for _, resource := range p {
		results = append(results, string(resource))
	}
	return results
}

func GetRoleByPermissions(perms UserPermissions) UserRoles {
	roles := UserRoles{}
	mapRoles := map[userRoles]UserPermissions{}
	for role, permissions := range mapRoles {
		ok := array.Contains(perms, permissions, func(a, b userPermissions) bool {
			return a == b
		})
		if ok {
			roles = append(roles, role)
		}
	}

	return roles
}

// Claims is the claims for a JWT
type Claims struct {
	UserID      string          `json:"userID"`
	Permissions UserPermissions `json:"permissions"`
	ApplID      string          `json:"applID"`
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
func ExtractPermissions(i interface{}) (c UserPermissions, err error) {
	perms, ok := i.(UserPermissions)
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
			if str, k := perm[i].(userPermissions); k {
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

// Value implements the driver Valuer interface.
func (i UserPermissions) Value() (driver.Value, error) {
	b, err := json.Marshal(i)
	return driver.Value(b), err
}

// Scan implements the Scanner interface.
func (i *UserPermissions) Scan(src interface{}) error {
	var source []byte

	switch v := src.(type) {
	case string:
		source = []byte(v)
	case []byte:
		source = src.([]byte)
	default:
		return errors.New("incompatible type for adminPermission")
	}
	return json.Unmarshal(source, i)
}
