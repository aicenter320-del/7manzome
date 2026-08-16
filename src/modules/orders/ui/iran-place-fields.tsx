"use client";

import { useMemo, useState } from "react";

import { citiesOfProvince, iranProvinceNames } from "@/shared/data/iran-places";
import { FormField } from "@/shared/ui/form-field";
import { SearchSelect } from "@/shared/ui/search-select";

/** استان و شهر از فهرست ایران؛ شهر تا انتخاب استان غیرفعال است. */
export function IranPlaceFields({
  provinceError,
  cityError,
}: {
  provinceError?: string;
  cityError?: string;
}) {
  const provinceOptions = useMemo(
    () => iranProvinceNames().map((name) => ({ value: name, label: name })),
    [],
  );
  const [province, setProvince] = useState("");
  const cities = useMemo(() => (province ? citiesOfProvince(province) : []), [province]);

  return (
    <div className="grid gap-5">
      <FormField id="province" label="استان" required {...(provinceError ? { error: provinceError } : {})}>
        <input type="hidden" name="province" value={province} />
        <SearchSelect
          id="province"
          value={province}
          placeholder="استان را بنویسید یا انتخاب کنید"
          options={provinceOptions}
          onChange={setProvince}
        />
      </FormField>

      <CityField key={province} province={province} cities={cities} error={cityError} />
    </div>
  );
}

function CityField({
  province,
  cities,
  error,
}: {
  province: string;
  cities: readonly string[];
  error?: string;
}) {
  const [city, setCity] = useState("");
  const cityOptions = useMemo(
    () => cities.map((name) => ({ value: name, label: name })),
    [cities],
  );

  return (
    <FormField id="city" label="شهر" required {...(error ? { error } : {})}>
      <input type="hidden" name="city" value={city} />
      <SearchSelect
        id="city"
        value={city}
        disabled={!province}
        placeholder={province ? "شهر را بنویسید یا انتخاب کنید" : "اول استان را انتخاب کنید"}
        options={cityOptions}
        onChange={setCity}
      />
    </FormField>
  );
}
