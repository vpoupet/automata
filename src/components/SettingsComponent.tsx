import { SubmitHandler, useForm } from "react-hook-form";
import { SettingsInterface } from "../types";
import Button from "./Common/Button";
import Heading from "./Common/Heading";
import Frame from "./Common/Frame";

interface SettingsComponentProps {
    settings: SettingsInterface;
    setSettings: (settings: SettingsInterface) => void;
}

export default function SettingsComponent(
    props: SettingsComponentProps
): JSX.Element {
    const { settings, setSettings } = props;
    const { register, handleSubmit } = useForm<SettingsInterface>({
        defaultValues: settings,
    });

    const onSubmit: SubmitHandler<SettingsInterface> = (data) => {
        console.log(data);
        setSettings(data);
    };

    return (
        <Frame className="absolute top-16 right-8 w-full max-w-sm z-50">
            <Heading level={2}>Settings</Heading>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="md:flex md:items-center mb-6">
                    <label className="md:w-1/2 block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4">
                        Grid radius
                    </label>
                    <input
                        id="radius"
                        className="md:w-1/2 border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:border-blue-500"
                        type="number"
                        {...register("gridRadius", {
                            valueAsNumber: true,
                            min: 1,
                            max: 10,
                        })}
                    />
                </div>
                <div className="md:flex md:items-center mb-6">
                    <label className="md:w-1/2 block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4">
                        Grid future steps
                    </label>
                    <input
                        type="number"
                        className="md:w-1/2 border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:border-blue-500"
                        {...register("gridNbFutureSteps", {
                            valueAsNumber: true,
                            min: 1,
                            max: 10,
                        })}
                    />
                </div>
                <div className="md:flex md:items-center mb-6">
                    <label className="md:w-1/2 block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4">
                        Nb cells
                    </label>
                    <input
                        type="number"
                        className="md:w-1/2 border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:border-blue-500"
                        {...register("nbCells", {
                            valueAsNumber: true,
                            min: 10,
                            max: 100,
                        })}
                    />
                </div>
                <div className="md:flex md:items-center mb-6">
                    <label className="md:w-1/2 block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4">
                        Nb steps
                    </label>
                    <input
                        type="number"
                        className="md:w-1/2 border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:border-blue-500"
                        {...register("nbSteps", {
                            valueAsNumber: true,
                            min: 5,
                            max: 200,
                        })}
                    />
                </div>
                <div className="md:flex md:items-center mb-6">
                    <label className="md:w-1/2 block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4">
                        Time goes up
                    </label>
                    <input
                        className="mr-2 leading-tight"
                        type="checkbox"
                        {...register("timeGoesUp")}
                    />
                </div>
                <div className="w-full flex flex-row justify-center">
                    <Button type="submit">Submit</Button>
                </div>
            </form>
        </Frame>
    );
}
