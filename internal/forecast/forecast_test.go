package forecast

import (
	"encoding/json"
	"math"
	"os"
	"testing"
)

type ParityFixture struct {
	AsOf        string  `json:"as_of"`
	Komoditas   string  `json:"komoditas"`
	Horizon     int     `json:"horizon"`
	HargaT      float64 `json:"harga_t"`
	SigmaT      float64 `json:"sigma_t"`
	Q10         float64 `json:"q10"`
	Q50         float64 `json:"q50"`
	Q90         float64 `json:"q90"`
	ExpectedP10 float64 `json:"expected_p10"`
	ExpectedP50 float64 `json:"expected_p50"`
	ExpectedP90 float64 `json:"expected_p90"`
}

func TestParity(t *testing.T) {
	data, err := os.ReadFile("../../data/parity_fixture.json")
	if err != nil {
		t.Fatalf("Gagal membaca fixture: %v", err)
	}

	var fixtures []ParityFixture
	if err := json.Unmarshal(data, &fixtures); err != nil {
		t.Fatalf("Gagal unmarshal fixture: %v", err)
	}

	for _, fix := range fixtures {
		sqrtH := math.Sqrt(float64(fix.Horizon))
		
		gotP10 := fix.HargaT * math.Exp(fix.Q10*fix.SigmaT*sqrtH)
		gotP50 := fix.HargaT * math.Exp(fix.Q50*fix.SigmaT*sqrtH)
		gotP90 := fix.HargaT * math.Exp(fix.Q90*fix.SigmaT*sqrtH)

		tol := 0.0001
		if math.Abs(gotP10-fix.ExpectedP10) > tol {
			t.Errorf("P10 mismatch. Got %f, want %f", gotP10, fix.ExpectedP10)
		}
		if math.Abs(gotP50-fix.ExpectedP50) > tol {
			t.Errorf("P50 mismatch. Got %f, want %f", gotP50, fix.ExpectedP50)
		}
		if math.Abs(gotP90-fix.ExpectedP90) > tol {
			t.Errorf("P90 mismatch. Got %f, want %f", gotP90, fix.ExpectedP90)
		}
	}
}
