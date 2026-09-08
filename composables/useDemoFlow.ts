export type DemoFlow = {
  name: string;
  nationalId?: string;
  city: string;
  watch: string;
  phone?: string;
  governorate?: string;
  addressDetails?: string;
};

const STORAGE_KEY = "gift_customer_flow_data";

export function useDemoFlow() {
  const getInitialFlow = (): DemoFlow => {
    const defaults: DemoFlow = {
      name: "",
      nationalId: "",
      city: "",
      watch: "",
      phone: "",
      governorate: "",
      addressDetails: "",
    };

    if (!import.meta.client) return defaults;

    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...defaults, ...parsed };
      }
    } catch {}

    const watch = window.localStorage.getItem("gift_customer_selected_watch") || "";
    const name = window.localStorage.getItem("gift_customer_name") || "";
    const nationalId = window.localStorage.getItem("gift_customer_national_id") || "";
    const phone = window.localStorage.getItem("gift_customer_phone") || "";
    const governorate = window.localStorage.getItem("gift_customer_governorate") || "";
    const addressDetails = window.localStorage.getItem("gift_customer_address") || "";

    return {
      name,
      nationalId,
      city: governorate,
      watch,
      phone,
      governorate,
      addressDetails,
    };
  };

  const flow = useState<DemoFlow>("aurora-gift-flow", () => getInitialFlow());

  const updateFlow = (patch: Partial<DemoFlow>) => {
    flow.value = {
      ...flow.value,
      ...patch,
    };

    if (import.meta.client) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(flow.value));
        if (patch.watch) window.localStorage.setItem("gift_customer_selected_watch", patch.watch);
        if (patch.name) window.localStorage.setItem("gift_customer_name", patch.name);
        if (patch.nationalId) window.localStorage.setItem("gift_customer_national_id", patch.nationalId);
        if (patch.phone) window.localStorage.setItem("gift_customer_phone", patch.phone);
        if (patch.governorate) window.localStorage.setItem("gift_customer_governorate", patch.governorate);
        if (patch.addressDetails) window.localStorage.setItem("gift_customer_address", patch.addressDetails);
      } catch {}
    }
  };

  return {
    flow,
    updateFlow,
  };
}
