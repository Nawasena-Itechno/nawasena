package store

import (
	"encoding/csv"
	"io"
	"log"
	"nawasena"
	"strconv"
)

type PriceRecord struct {
	Tanggal   string
	Provinsi  string
	Komoditas string
	Harga     float64
}

type QuantileRecord struct {
	AsOf      string
	Komoditas string
	Horizon   int
	Ember     int
	Q10       float64
	Q50       float64
	Q90       float64
}

var Prices []PriceRecord
var Quantiles []QuantileRecord

func InitStore() {
	loadPrices()
	loadQuantiles()
}

func loadPrices() {
	file, err := nawasena.DataFS.Open("data/prices.csv")
	if err != nil {
		log.Printf("Warning: data/prices.csv not found: %v", err)
		return
	}
	defer file.Close()

	reader := csv.NewReader(file)
	_, _ = reader.Read() // skip header

	for {
		record, err := reader.Read()
		if err == io.EOF {
			break
		}
		if err != nil {
			log.Fatal(err)
		}

		harga, _ := strconv.ParseFloat(record[3], 64)
		Prices = append(Prices, PriceRecord{
			Tanggal:   record[0][:10], // YYYY-MM-DD
			Provinsi:  record[1],
			Komoditas: record[2],
			Harga:     harga,
		})
	}
}

func loadQuantiles() {
	file, err := nawasena.DataFS.Open("data/quantiles.csv")
	if err != nil {
		log.Printf("Warning: data/quantiles.csv not found: %v", err)
		return
	}
	defer file.Close()

	reader := csv.NewReader(file)
	_, _ = reader.Read()

	for {
		record, err := reader.Read()
		if err == io.EOF {
			break
		}
		if err != nil {
			log.Fatal(err)
		}

		horizon, _ := strconv.Atoi(record[2])
		ember, _ := strconv.Atoi(record[3])
		q10, _ := strconv.ParseFloat(record[4], 64)
		q50, _ := strconv.ParseFloat(record[5], 64)
		q90, _ := strconv.ParseFloat(record[6], 64)

		Quantiles = append(Quantiles, QuantileRecord{
			AsOf:      record[0][:10],
			Komoditas: record[1],
			Horizon:   horizon,
			Ember:     ember,
			Q10:       q10,
			Q50:       q50,
			Q90:       q90,
		})
	}
}

func GetPrices(komoditas, provinsi, asOf string) []PriceRecord {
	var res []PriceRecord
	for _, p := range Prices {
		if p.Komoditas == komoditas && p.Provinsi == provinsi && p.Tanggal <= asOf {
			res = append(res, p)
		}
	}
	return res
}

func GetLatestQuantiles(komoditas string, asOf string) []QuantileRecord {
	var latestAsOf string
	for _, q := range Quantiles {
		if q.Komoditas == komoditas && q.AsOf <= asOf {
			if q.AsOf > latestAsOf {
				latestAsOf = q.AsOf
			}
		}
	}

	var res []QuantileRecord
	for _, q := range Quantiles {
		if q.Komoditas == komoditas && q.AsOf == latestAsOf {
			res = append(res, q)
		}
	}
	return res
}
