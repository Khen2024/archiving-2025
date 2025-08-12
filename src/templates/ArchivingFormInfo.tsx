import { Email, TextField } from "seti-ramesesv1";

const ArchivingFormInfo = () =>
{
    return (  
        <div>
            <div className="flex gap-x-2">
        <TextField label="Last Name" required fullWidth value={"DEALA CROSS"} readOnly />
        <TextField label="First Name" required fullWidth value={"WHOWAN"} readOnly />
        <TextField label="Middle Name" fullWidth value={"N/A"} readOnly />
      </div>

      <div>
        <TextField label="TIN" fullWidth value={"N/A"} readOnly />
      </div>

      <div>
        <Email label="Email Address" fullWidth value={"whowan@gmail.com"} readOnly />
      </div>

      <div className="flex gap-x-2">
        <TextField label="Phone No." fullWidth value={"09348567215"} readOnly />
        <TextField label="Mobile No." fullWidth value={"422-1458"} readOnly />
      </div>
    </div>
    )
}

export default ArchivingFormInfo;