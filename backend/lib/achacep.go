package lib

import (
	"encoding/json"
	"log"
	"strings"

	"github.com/gocolly/colly/v2"
)

type latlong struct {
	Latitude  string `json:"latitude"`
	Longitude string `json:"longitude"`
}

func fromAchaCEP(cep string, log *log.Logger) *latlong {
	c := colly.NewCollector()

	var response *latlong

	c.OnHTML("script[type=\"application/ld+json\"]", func(e *colly.HTMLElement) {
		geo := struct {
			Geo latlong `json:"geo"`
		}{}
		if err := json.Unmarshal([]byte(e.Text), &geo); err != nil && log != nil {
			log.Println("error", err, e.Text)
		} else if len(strings.TrimSpace(geo.Geo.Latitude)) > 0 && len(strings.TrimSpace(geo.Geo.Longitude)) > 0 {
			response = &geo.Geo
		}

		// do nothing, we won't use the CEP information
		/*
			address := struct {
				AddressCountry  string `json:"addressCountry"`
				AddressLocality string `json:"addressLocality"`
				AddressRegion   string `json:"addressRegion"`
				PostalCode      string `json:"postalCode"`
				StreetAddress   string `json:"streetAddress"`
			}{}
			if err := json.Unmarshal([]byte(e.Text), &address); err != nil {
			}
		*/
	})

	c.Visit("https://achacep.com.br/" + cep + "/cep")
	c.Wait()
	return response
}
