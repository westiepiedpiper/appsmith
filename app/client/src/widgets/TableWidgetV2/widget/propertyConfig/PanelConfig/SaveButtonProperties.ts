import { ValidationTypes } from "constants/WidgetValidation";
import {
  ColumnTypes,
  ICON_NAMES,
  TableWidgetProps,
} from "widgets/TableWidgetV2/constants";
import { ButtonVariantTypes } from "components/constants";
import { hideByColumnType } from "../../propertyUtils";

export default {
  sectionName: "Save Button",
  hidden: (props: TableWidgetProps, propertyPath: string) => {
    return hideByColumnType(
      props,
      propertyPath,
      [ColumnTypes.EDIT_ACTIONS],
      true,
    );
  },
  children: [
    {
      propertyName: "isSaveVisible",
      dependencies: ["primaryColumns"],
      label: "Visible",
      helpText: "Controls the visibility of the save button",
      defaultValue: true,
      controlType: "SWITCH",
      customJSControl: "COMPUTE_VALUE_V2",
      isJSConvertible: true,
      isBindProperty: true,
      isTriggerProperty: false,
      validation: {
        type: ValidationTypes.TABLE_PROPERTY,
        params: {
          type: ValidationTypes.BOOLEAN,
        },
      },
    },
    {
      propertyName: "isSaveDisabled",
      label: "Disabled",
      defaultValue: false,
      controlType: "SWITCH",
      customJSControl: "COMPUTE_VALUE_V2",
      isJSConvertible: true,
      isBindProperty: true,
      isTriggerProperty: false,
      validation: {
        type: ValidationTypes.TABLE_PROPERTY,
        params: {
          type: ValidationTypes.BOOLEAN,
        },
      },
      dependencies: ["primaryColumns"],
    },
    {
      propertyName: "saveActionLabel",
      label: "Action label",
      controlType: "COMPUTE_VALUE_V2",
      dependencies: ["primaryColumns"],
      isBindProperty: true,
      isTriggerProperty: false,
    },
    {
      propertyName: "saveButtonColor",
      label: "Button Color",
      controlType: "COLOR_PICKER",
      helpText: "Changes the color of the button",
      isJSConvertible: true,
      customJSControl: "COMPUTE_VALUE_V2",
      dependencies: ["primaryColumns"],
      isBindProperty: true,
      validation: {
        type: ValidationTypes.TABLE_PROPERTY,
        params: {
          type: ValidationTypes.TEXT,
          params: {
            regex: /^(?![<|{{]).+/,
          },
        },
      },
      isTriggerProperty: false,
    },
    {
      propertyName: "saveButtonVariant",
      label: "Button Variant",
      controlType: "DROP_DOWN",
      customJSControl: "COMPUTE_VALUE_V2",
      isJSConvertible: true,
      helpText: "Sets the variant of the save button",
      dependencies: ["primaryColumns"],
      options: [
        {
          label: "Primary",
          value: ButtonVariantTypes.PRIMARY,
        },
        {
          label: "Secondary",
          value: ButtonVariantTypes.SECONDARY,
        },
        {
          label: "Tertiary",
          value: ButtonVariantTypes.TERTIARY,
        },
      ],
      defaultValue: ButtonVariantTypes.PRIMARY,
      isBindProperty: true,
      isTriggerProperty: false,
      validation: {
        type: ValidationTypes.TABLE_PROPERTY,
        params: {
          type: ValidationTypes.TEXT,
          params: {
            default: ButtonVariantTypes.PRIMARY,
            allowedValues: [
              ButtonVariantTypes.PRIMARY,
              ButtonVariantTypes.SECONDARY,
              ButtonVariantTypes.TERTIARY,
            ],
          },
        },
      },
    },
    {
      propertyName: "saveBorderRadius",
      label: "Border Radius",
      customJSControl: "COMPUTE_VALUE_V2",
      isJSConvertible: true,
      helpText: "Rounds the corners of the save button's outer border edge",
      controlType: "BORDER_RADIUS_OPTIONS",
      dependencies: ["primaryColumns"],
      isBindProperty: true,
      isTriggerProperty: false,
      validation: {
        type: ValidationTypes.TABLE_PROPERTY,
        params: {
          type: ValidationTypes.TEXT,
        },
      },
    },
    {
      propertyName: "saveActionIconName",
      label: "Action Icon",
      helpText: "Sets the icon to be used for the save action button",
      dependencies: ["primaryColumns", "columnOrder"],
      controlType: "ICON_SELECT",
      customJSControl: "COMPUTE_VALUE_V2",
      isJSConvertible: true,
      isBindProperty: true,
      isTriggerProperty: false,
      validation: {
        type: ValidationTypes.TABLE_PROPERTY,
        params: {
          type: ValidationTypes.TEXT,
          params: {
            allowedValues: ICON_NAMES,
          },
        },
      },
    },
    {
      propertyName: "saveIconAlign",
      label: "Icon Alignment",
      helpText: "Sets the icon alignment of the save button",
      controlType: "ICON_TABS",
      defaultValue: "left",
      options: [
        {
          icon: "VERTICAL_LEFT",
          value: "left",
        },
        {
          icon: "VERTICAL_RIGHT",
          value: "right",
        },
      ],
      isBindProperty: false,
      isTriggerProperty: false,
      dependencies: ["primaryColumns"],
      validation: {
        type: ValidationTypes.TEXT,
        params: {
          allowedValues: ["center", "left", "right"],
        },
      },
    },
  ],
};
