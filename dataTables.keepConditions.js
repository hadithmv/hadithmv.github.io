/**
 * @summary     KeepConditions
 * @description Store DataTable state in URL for sharing table state via copy/paste
 * @version     2.0.0
 * @author      Original: Justin Hyland, Modernized: [Your Name]
 * @license     MIT
 */

class KeepConditions {
  static #defaults = {
    language: {
      keepConditions: {
        button: {
          btnCopyTitle: "URL Copied",
          btnCopyBody:
            "The URL with the DataTables conditions has been copied to your clipboard",
          btnSelectTitle: "Copy URL",
          btnSelectBody: "Copy the below URL to share the table state",
        },
      },
    },
  };

  #dtApi;
  #dtSettings;
  #tableId;
  #shouldDraw = false;
  #enabledConditions = new Set();
  #eventNamespace = "keepConditions";

  /**
   * @param {object} dtSettings DataTable settings object
   */
  constructor(dtSettings) {
    if (!this.#isDataTable(dtSettings)) {
      throw new Error(
        "Failed to initialize KeepConditions: Not a DataTable instance"
      );
    }

    this.#dtSettings = dtSettings;
    this.#dtApi = new DataTable.Api(dtSettings);
    this.#tableId = this.#dtApi.table().node().id;

    // Store instance on settings
    dtSettings.oKeepConditions = this;

    this.#init();
  }

  /**
   * Check if object is a DataTable instance
   * @private
   */
  #isDataTable(obj) {
    return (
      obj instanceof DataTable.Api || obj?.constructor?.name === "DataTable"
    );
  }

  /**
   * Parse URL hash into query params
   */
  static parseHash() {
    const hash = window.location.hash.substring(1);
    if (!hash) return {};

    return Object.fromEntries(
      hash
        .split("&")
        .map((pair) => pair.split("="))
        .filter(([key]) => key)
    );
  }

  /**
   * Initialize the plugin
   * @private
   */
  #init() {
    this.#collectEnabled();

    if (this.#shouldAttachEvents()) {
      this.attachEvents();
    }

    this.processHash();
  }

  /**
   * Check if events should be attached based on settings
   * @private
   */
  #shouldAttachEvents() {
    const settings = this.#dtSettings.oInit.keepConditions;
    return (
      settings === true ||
      typeof settings === "string" ||
      Array.isArray(settings) ||
      (settings?.attachEvents ?? true)
    );
  }

  /**
   * Collect enabled conditions
   * @private
   */
  #collectEnabled() {
    for (const [name, condition] of Object.entries(this.#getConditions())) {
      if (this.#isEnabled(name) && condition.isInit()) {
        this.#enabledConditions.add(name);
      }
    }
  }

  /**
   * Get available conditions
   * @private
   */
  #getConditions() {
    return {
      search: {
        key: "f",
        event: "search.dt",
        isInit: () => this.#dtSettings.oInit.searching !== false,
        onLoad: (value) => {
          if (value && this.#dtApi.search() !== decodeURIComponent(value)) {
            this.#dtApi.search(decodeURIComponent(value));
            this.#shouldDraw = true;
          }
        },
        isset: () => this.#dtApi.search().length > 0,
        newHashVal: () => encodeURIComponent(this.#dtApi.search()),
      },
      length: {
        key: "l",
        event: "length.dt",
        isInit: () => this.#dtSettings.oInit.lengthChange !== false,
        onLoad: (value) => {
          if (value) {
            this.#dtApi.page.len(parseInt(value));
            this.#shouldDraw = true;
          }
        },
        isset: () => {
          const defaultLength = this.#dtSettings.oInit.pageLength || 10;
          return this.#dtApi.page.len() !== defaultLength;
        },
        newHashVal: () => this.#dtApi.page.len(),
      },
      page: {
        key: "p",
        event: "page.dt",
        isInit: () => this.#dtSettings.oInit.paging !== false,
        onLoad: (value) => {
          if (value && parseInt(value) !== 0) {
            this.#dtApi.page(parseInt(value));
            this.#shouldDraw = true;
          }
        },
        isset: () => this.#dtApi.page.info()?.page !== 0,
        newHashVal: () => this.#dtApi.page.info()?.page,
      },
      order: {
        key: "o",
        event: "order.dt",
        isInit: () => this.#dtSettings.aoColumns.some((col) => col.bSortable),
        onLoad: (value) => {
          if (!value) return;
          const dir = { a: "asc", d: "desc" };
          this.#dtApi.order([
            parseInt(value.substring(1)),
            dir[value.charAt(0)],
          ]);
          this.#shouldDraw = true;
        },
        isset: () => {
          const order = this.#dtApi.order()[0];
          return order && JSON.stringify(order) !== JSON.stringify([0, "asc"]);
        },
        newHashVal: () => {
          const order = this.#dtApi.order()[0];
          return order ? order[1].charAt(0) + order[0] : null;
        },
      },
      // Additional conditions can be added here
    };
  }

  /**
   * Check if condition is enabled
   * @private
   */
  #isEnabled(condition) {
    const settings = this.#dtSettings.oInit.keepConditions;

    if (settings === true) return true;

    if (typeof settings === "string") {
      return settings.includes(this.#getConditions()[condition].key);
    }

    if (Array.isArray(settings)) {
      return settings.includes(condition);
    }

    if (settings?.conditions) {
      return Array.isArray(settings.conditions)
        ? settings.conditions.includes(condition)
        : settings.conditions.includes(this.#getConditions()[condition].key);
    }

    return false;
  }

  /**
   * Get condition name by key
   * @private
   */
  #getConditionNameByKey(key) {
    return Object.entries(this.#getConditions()).find(
      ([_, condition]) => condition.key === key
    )?.[0];
  }

  // Public API methods

  /**
   * Attach condition update events
   */
  attachEvents() {
    for (const condition of this.#enabledConditions) {
      const { event } = this.#getConditions()[condition];
      this.#dtApi.on(
        `${event}.${this.#eventNamespace}`,
        { dtSettings: this.#dtSettings },
        () => this.updateHash()
      );
    }
  }

  /**
   * Detach condition update events
   */
  detachEvents() {
    for (const condition of this.#enabledConditions) {
      const { event } = this.#getConditions()[condition];
      this.#dtApi.off(`${event}.${this.#eventNamespace}`);
    }
  }

  /**
   * Process URL hash and update table state
   */
  processHash() {
    const hash = KeepConditions.parseHash();
    const tableConditions = hash[this.#tableId];

    if (!tableConditions) return;

    for (const condition of tableConditions.split(":")) {
      const key = condition.charAt(0);
      const value = condition.substring(1);
      const name = this.#getConditionNameByKey(key);

      if (!name || !this.#enabledConditions.has(name)) continue;

      this.#getConditions()[name].onLoad(value);
    }

    if (this.#shouldDraw) {
      this.#dtApi.draw();
      this.#shouldDraw = false;
    }
  }

  /**
   * Update URL hash with current conditions
   */
  updateHash(returnHash = false) {
    const conditions = [];

    for (const name of this.#enabledConditions) {
      const condition = this.#getConditions()[name];
      if (condition.isset()) {
        const value = condition.newHashVal();
        if (value) {
          conditions.push(`${condition.key}${value}`);
        }
      }
    }

    const hash = conditions.length
      ? `${this.#tableId}=${conditions.join(":")}`
      : "";

    if (returnHash) return hash;
    window.location.hash = hash || "_";
  }
}

// DataTables plugin registration
DataTable.KeepConditions = KeepConditions;

document.addEventListener("init.dt", (e) => {
  if (!e.detail?.settings?.oInit?.keepConditions) return;
  new KeepConditions(e.detail.settings);
});

// Button extension
DataTable.ext.buttons.copyConditions = {
  text: "Copy Conditions",
  action: async (e, dt, node, config) => {
    const kc = dt.settings()[0].oKeepConditions;
    if (!kc) return;

    const url = new URL(window.location.href);
    url.hash = kc.updateHash(true);

    try {
      await navigator.clipboard.writeText(url.toString());
      dt.buttons.info(
        config.language?.btnCopyTitle || "URL Copied",
        config.language?.btnCopyBody || "Table state URL copied to clipboard",
        config.copyTimeout || 4000
      );
    } catch (err) {
      const input = document.createElement("input");
      input.value = url.toString();
      input.className = "dt-button-input";

      dt.buttons.info(
        config.language?.btnSelectTitle || "Copy URL",
        input.outerHTML,
        config.selectTimeout || 10000
      );

      document.querySelector(".dt-button-input")?.select();
    }
  },
};
