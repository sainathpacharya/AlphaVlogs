import CheckCircle from "@/assets/icons/CheckCircle";
import { HStack, Text } from "@/components";
import { useTranslation } from "react-i18next";

interface IAcceptingNewPatientsBadgeProps {
  acceptingNewPatients: boolean;
  my?: any;
  color?: string;
  fontSize?: string | any;
}
const AcceptingNewPatientsBadge = (props: IAcceptingNewPatientsBadgeProps) => {
  const { t } = useTranslation();
  const { acceptingNewPatients, my, color = "black", fontSize = "$md" } = props;
  if (!acceptingNewPatients) return <></>;
  return (
    <HStack alignItems="center" space="xs" my={my}>
      <CheckCircle size={18} color={color} />
      <Text color="black" fontSize={fontSize}>
        {t("GET_CARE.COST_ESTIMATOR.ITEMS.ACCEPTING_NEW")}
      </Text>
    </HStack>
  );
};

export default AcceptingNewPatientsBadge;
