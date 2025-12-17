import { SubmitHandler, useForm } from "react-hook-form";
import { SettingsInterface } from "../types";
import Button from "./Common/Button";
import Heading from "./Common/Heading";
import Frame from "./Common/Frame";

interface SettingsComponentProps {
    settings: SettingsInterface;
    setSettings: (settings: SettingsInterface) => void;
    setIsSettingsOpen: (isOpen: boolean) => void;
}

export default function SettingsComponent(
    props: SettingsComponentProps
): JSX.Element {
    const { settings, setSettings, setIsSettingsOpen } = props;
    const { register, handleSubmit } = useForm<SettingsInterface>({
        defaultValues: settings,
    });

    const onSubmit: SubmitHandler<SettingsInterface> = (data) => {
        console.log(data);
        setSettings(data);
        setIsSettingsOpen(false);
    };

    return (
        <Frame className="absolute z-50 w-full max-w-sm top-16 right-8">
            <Heading level={2}>Settings</Heading>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="mb-6 md:flex md:items-center">
                    <label className="block pr-4 mb-1 font-bold text-gray-500 md:w-1/2 md:text-right md:mb-0">
                        Grid radius
                    </label>
                    <input
                        id="radius"
                        className="w-full px-4 py-2 leading-tight text-gray-700 border-2 border-gray-200 rounded md:w-1/2 focus:outline-none focus:border-blue-500"
                        type="number"
                        {...register("gridRadius", {
                            valueAsNumber: true,
                            min: 1,
                            max: 10,
                        })}
                    />
                </div>
                <div className="mb-6 md:flex md:items-center">
                    <label className="block pr-4 mb-1 font-bold text-gray-500 md:w-1/2 md:text-right md:mb-0">
                        Grid future steps
                    </label>
                    <input
                        type="number"
                        className="w-full px-4 py-2 leading-tight text-gray-700 border-2 border-gray-200 rounded md:w-1/2 focus:outline-none focus:border-blue-500"
                        {...register("gridNbFutureSteps", {
                            valueAsNumber: true,
                            min: 1,
                            max: 10,
                        })}
                    />
                </div>
                <div className="mb-6 md:flex md:items-center">
                    <label className="block pr-4 mb-1 font-bold text-gray-500 md:w-1/2 md:text-right md:mb-0">
                        Nb cells
                    </label>
                    <input
                        type="number"
                        className="w-full px-4 py-2 leading-tight text-gray-700 border-2 border-gray-200 rounded md:w-1/2 focus:outline-none focus:border-blue-500"
                        {...register("nbCells", {
                            valueAsNumber: true,
                            min: 10,
                            max: 100,
                        })}
                    />
                </div>
                <div className="mb-6 md:flex md:items-center">
                    <label className="block pr-4 mb-1 font-bold text-gray-500 md:w-1/2 md:text-right md:mb-0">
                        Nb steps
                    </label>
                    <input
                        type="number"
                        className="w-full px-4 py-2 leading-tight text-gray-700 border-2 border-gray-200 rounded md:w-1/2 focus:outline-none focus:border-blue-500"
                        {...register("nbSteps", {
                            valueAsNumber: true,
                            min: 5,
                            max: 200,
                        })}
                    />
                </div>
                <div className="mb-6 md:flex md:items-center">
                    <label className="block pr-4 mb-1 font-bold text-gray-500 md:w-1/2 md:text-right md:mb-0">
                        Time goes up
                    </label>
                    <input
                        className="mr-2 leading-tight"
                        type="checkbox"
                        {...register("timeGoesUp")}
                    />
                </div>
                <div className="flex flex-row justify-center w-full">
                    <Button type="submit">Submit</Button>
                </div>
            </form>
        </Frame>
    );
}
